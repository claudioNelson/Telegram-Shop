import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TwoFaService } from './two-fa.service';

@Controller('api/two-fa')
export class TwoFaController {
  constructor(private twoFaService: TwoFaService) { }

  /**
   * POST /api/two-fa/upload-key
   * User lädt seinen PGP Public Key hoch
   */
  @Post('upload-key')
  @UseGuards(AuthGuard('jwt'))
  async uploadPublicKey(
    @Request() req: any,
    @Body() body: { publicKey: string },
  ) {
    if (!body.publicKey) {
      throw new BadRequestException('publicKey is required');
    }

    const userId = req.user.userId;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    await this.twoFaService.uploadPublicKey(userId, body.publicKey);

    return {
      success: true,
      message: '2FA Public Key uploaded successfully',
    };
  }

  /**
   * POST /api/two-fa/generate-challenge
   * Backend generiert verschlüsselte Challenge
   * Rückgabe: challengeId + encryptedChallenge
   */
  @Post('generate-challenge')
  @UseGuards(AuthGuard('jwt'))
  async generateChallenge(@Request() req: any) {
    const userId = req.user.userId;  // ← NICHT sub!
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    const { challengeId, encryptedChallenge } =
      await this.twoFaService.generateChallenge(userId);

    return {
      success: true,
      challengeId,
      encryptedChallenge,
      message: 'Challenge generated. User needs to decrypt and sign it.',
    };
  }

  /**
   * POST /api/two-fa/verify-signature
   * User sendet signierte Challenge zurück
   * Rückgabe: JWT Token wenn erfolgreich
   */
  @Post('verify-signature')
  @HttpCode(200)
  async verifySignature(
    @Body()
    body: {
      userId: number;
      challengeId: string;
      challenge: string;
      signature: string;
    },
  ) {
    if (
      !body.userId ||
      !body.challengeId ||
      !body.challenge ||
      !body.signature
    ) {
      throw new BadRequestException(
        'userId, challengeId, challenge, and signature are required',
      );
    }

    const isValid = await this.twoFaService.verifySignature(
      body.userId,
      body.challengeId,
      body.challenge,
      body.signature,
    );

    if (!isValid) {
      throw new BadRequestException('Signature verification failed');
    }

    return {
      success: true,
      message: 'Signature verified successfully. Login successful!',
    };
  }

  @Get('status')
  @UseGuards(AuthGuard('jwt'))
  async getTwoFaStatus(@Request() req: any) {
    const userId = req.user.userId;  // ← NICHT sub!
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    const status = await this.twoFaService.getTwoFaStatus(userId);

    return {
      success: true,
      data: status,
    };
  }

  /**
   * POST /api/two-fa/disable
   * User deaktiviert 2FA
   */
  @Post('disable')
  @UseGuards(AuthGuard('jwt'))
  async disableTwoFa(@Request() req: any) {
    const userId = req.user.sub;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    await this.twoFaService.disableTwoFa(userId);

    return {
      success: true,
      message: '2FA disabled successfully',
    };
  }
}
