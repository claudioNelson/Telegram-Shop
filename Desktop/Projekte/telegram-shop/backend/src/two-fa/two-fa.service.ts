import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as openpgp from 'openpgp';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';

// In-Memory Challenge Storage
interface StoredChallenge {
  userId: number;
  challenge: string;
  createdAt: number;
}

@Injectable()
export class TwoFaService {
  private challengeStore = new Map<string, StoredChallenge>();
  private readonly CHALLENGE_TTL = 5 * 60 * 1000;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,  // ← NEUE ZEILE!
  ) {
    setInterval(() => this.cleanupExpiredChallenges(), 60 * 1000);
  }

  /**
   * Cleanup abgelaufene Challenges
   */
  private cleanupExpiredChallenges(): void {
    const now = Date.now();
    for (const [challengeId, data] of this.challengeStore.entries()) {
      if (now - data.createdAt > this.CHALLENGE_TTL) {
        this.challengeStore.delete(challengeId);
      }
    }
  }

  /**
   * SCHRITT 1: User uploaded Public Key
   * Speichere Public Key und aktiviere 2FA
   */
  async uploadPublicKey(userId: number, publicKeyPem: string): Promise<void> {
    try {
      await openpgp.readKey({ armoredKey: publicKeyPem });
    } catch (error) {
      throw new BadRequestException('Invalid PGP Public Key format');
    }

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
   * Rückgabe: Encrypted Challenge
   */
  async generateChallenge(userId: number): Promise<{
    challengeId: string;
    encryptedChallenge: string;
  }> {
    const twoFaConfig = await (this.prisma as any).twoFaConfig.findUnique({
      where: { userId },
    });

    if (!twoFaConfig || !twoFaConfig.isEnabled) {
      throw new NotFoundException('2FA not enabled for this user');
    }

    // Generiere zufällige Challenge (32 bytes = 256 bit)
    const challenge = crypto.randomBytes(32).toString('hex');
    const challengeId = crypto.randomBytes(16).toString('hex');

    // Speichere Challenge im In-Memory Store
    this.challengeStore.set(challengeId, {
      userId,
      challenge,
      createdAt: Date.now(),
    });

    console.log(`[2FA] Challenge generated - ID: ${challengeId}, User: ${userId}`);

    // Verschlüssele Challenge mit User's Public Key
    const publicKey = await openpgp.readKey({
      armoredKey: twoFaConfig.publicKeyPgp,
    });

    const encrypted = await openpgp.encrypt({
      message: await openpgp.createMessage({ text: challenge }),
      encryptionKeys: publicKey,
    });

    return {
      challengeId,
      encryptedChallenge: encrypted as string,
    };
  }

  /**
   * SCHRITT 3 (VEREINFACHT): Verifiziere nur die Challenge
   * User sendet die entschlüsselte Challenge zurück
   * Backend vergleicht mit gespeichert Challenge
   */
async verifyChallengeOnly(
  userId: number,
  challengeId: string,
  decryptedChallenge: string,
): Promise<boolean> {
  const storedChallenge = this.challengeStore.get(challengeId);

  console.log(`[DEBUG] Verify - ChallengeId: ${challengeId}`);
  console.log(`[DEBUG] Store has ${this.challengeStore.size} challenges`);
  console.log(`[DEBUG] Stored challenge:`, storedChallenge);
  console.log(`[DEBUG] Decrypted challenge: ${decryptedChallenge}`);

  if (!storedChallenge) {
    throw new BadRequestException('Challenge not found or expired');
  }

  if (storedChallenge.userId !== userId) {
    throw new BadRequestException('Challenge belongs to different user');
  }

  if (storedChallenge.challenge !== decryptedChallenge) {
    console.log(`[DEBUG] Challenge mismatch!`);
    console.log(`[DEBUG] Expected: ${storedChallenge.challenge}`);
    console.log(`[DEBUG] Got: ${decryptedChallenge}`);
    throw new BadRequestException('Challenge verification failed');
  }

  this.challengeStore.delete(challengeId);
  console.log(`[2FA] Challenge verified successfully - User: ${userId}`);

  return true;
}

  /**
   * SCHRITT 4: Disable 2FA
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
      return {
        enabled: false,
        hasPublicKey: false,
      };
    }
  }

  // Brauchen wir JwtService zum generieren von Tokens
/**
   * Generiere JWT Token nach erfolgreicher Challenge-Verifizierung
   */
  async generateLoginToken(userId: number): Promise<{
    accessToken: string;
    refreshToken: string;
    user: any;
  }> {
    const user = await (this.prisma as any).user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}