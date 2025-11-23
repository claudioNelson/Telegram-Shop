import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as openpgp from 'openpgp';
import * as crypto from 'crypto';

@Injectable()
export class TwoFaService {
  constructor(private prisma: PrismaService) {}

  /**
   * SCHRITT 1: User uploaded Public Key
   * Speichere Public Key und aktiviere 2FA
   */
  async uploadPublicKey(userId: number, publicKeyPem: string): Promise<void> {
    // Validiere, dass es ein gültiger PGP Public Key ist
    try {
      await openpgp.readKey({ armoredKey: publicKeyPem });
    } catch (error) {
      throw new BadRequestException('Invalid PGP Public Key format');
    }

    // Speichere oder update TwoFaConfig
    await (this.prisma as any).twoFaConfig.upsert({
      where: { userId },
      update: {
        publicKeyPgp: publicKeyPem,
        isEnabled: true,
      },
      create: {
        userId,
        publicKeyPgp: publicKeyPem,
        isEnabled: true,
      },
    });
  }

  /**
   * SCHRITT 2: Backend generiert Challenge
   * Rückgabe: Challenge (wird verschlüsselt und an User geschickt)
   */
  async generateChallenge(userId: number): Promise<{
    challengeId: string;
    encryptedChallenge: string;
  }> {
    // Hole 2FA Config
    const twoFaConfig = await (this.prisma as any).twoFaConfig.findUnique({
      where: { userId },
    });

    if (!twoFaConfig || !twoFaConfig.isEnabled) {
      throw new NotFoundException('2FA not enabled for this user');
    }

    // Generiere zufällige Challenge (32 bytes = 256 bit)
    const challenge = crypto.randomBytes(32).toString('hex');
    const challengeId = crypto.randomBytes(16).toString('hex');

    // Speichere Challenge temporär (TTL: 5 Minuten)
    // Alternativ: In Memory-Store oder Redis verwenden
    // Hier nehmen wir vereinfacht an, dass es im Session-Store gespeichert wird
    // In Produktion: Redis oder DB mit Expiration

    // Verschlüssele Challenge mit User's Public Key
    const publicKey = await openpgp.readKey({
      armoredKey: twoFaConfig.publicKeyPgp,
    });

    const encrypted = await openpgp.encrypt({
      message: await openpgp.createMessage({ text: challenge }),
      encryptionKeys: publicKey,
    });

    return {
      challengeId, // ID für Verifizierung später
      encryptedChallenge: encrypted as string, // Verschlüsselte Challenge
    };
  }

  /**
   * SCHRITT 3: User signiert Challenge mit Private Key
   * Rückgabe: Signature String
   * 
   * Frontend Flow:
   * 1. User empfängt encryptedChallenge
   * 2. User entschlüsselt mit eigenem Private Key
   * 3. User signiert entschlüsselte Challenge
   * 4. Sendet Signature zum Backend
   */
  async verifySignature(
    userId: number,
    challengeId: string,
    challenge: string,
    signature: string,
  ): Promise<boolean> {
    // Hole 2FA Config
    const twoFaConfig = await (this.prisma as any).twoFaConfig.findUnique({
      where: { userId },
    });

    if (!twoFaConfig || !twoFaConfig.isEnabled) {
      throw new NotFoundException('2FA not enabled for this user');
    }

    try {
      // Lese Public Key
      const publicKey = await openpgp.readKey({
        armoredKey: twoFaConfig.publicKeyPgp,
      });

      // Verifiziere die Signatur
      const verified = await openpgp.verify({
        message: await openpgp.createMessage({ text: challenge }),
        signature: await openpgp.readSignature({
          armoredSignature: signature,
        }),
        verificationKeys: publicKey,
      });

      // Prüfe ob mindestens eine Signatur valid ist
      const isValid = verified.signatures.some((sig: any) => sig.valid === true);

      if (!isValid) {
        throw new BadRequestException('Signature verification failed');
      }

      return true;
    } catch (error) {
      console.error('Signature verification error:', error);
      throw new BadRequestException('Invalid signature');
    }
  }

  /**
   * SCHRITT 4: Disable 2FA
   * User kann 2FA deaktivieren
   */
  async disableTwoFa(userId: number): Promise<void> {
    await (this.prisma as any).twoFaConfig.update({
      where: { userId },
      data: { isEnabled: false },
    });
  }

  /**
   * SCHRITT 5: Check ob 2FA aktiviert ist
   */
  async isTwoFaEnabled(userId: number): Promise<boolean> {
    const twoFaConfig = await (this.prisma as any).twoFaConfig.findUnique({
      where: { userId },
    });

    return twoFaConfig?.isEnabled ?? false;
  }

  /**
   * SCHRITT 6: Get 2FA Status
   */
async getTwoFaStatus(userId: number): Promise<{
  enabled: boolean;
  hasPublicKey: boolean;
}> {
  try {
    const twoFaConfig = await (this.prisma as any).twoFaConfig.findUnique({
      where: { userId },
    });

    return {
      enabled: twoFaConfig?.isEnabled ?? false,
      hasPublicKey: !!twoFaConfig?.publicKeyPgp,
    };
  } catch (error) {
    console.error('getTwoFaStatus error:', error);
    // Wenn noch keine 2FA Config existiert - return defaults
    return {
      enabled: false,
      hasPublicKey: false,
    };
  }
}}