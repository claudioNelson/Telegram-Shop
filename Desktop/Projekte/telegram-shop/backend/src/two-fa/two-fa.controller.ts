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
  constructor(private twoFaService: TwoFaService) {}

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
   */
  @Post('generate-challenge')
  @UseGuards(AuthGuard('jwt'))
  async generateChallenge(@Request() req: any) {
    const userId = req.user.userId;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    const { challengeId, encryptedChallenge } =
      await this.twoFaService.generateChallenge(userId);

    return {
      success: true,
      challengeId,
      encryptedChallenge,
      message: 'Challenge generated',
    };
  }

  /**
   * POST /api/two-fa/verify-challenge
   * User sendet entschlüsselte Challenge zurück
   */
  @Post('verify-challenge')
  @HttpCode(200)
  async verifyChallengeOnly(
    @Body()
    body: {
      userId: number;
      challengeId: string;
      decryptedChallenge: string;
    },
  ) {
    if (!body.userId || !body.challengeId || !body.decryptedChallenge) {
      throw new BadRequestException(
        'userId, challengeId, and decryptedChallenge are required',
      );
    }

    const isValid = await this.twoFaService.verifyChallengeOnly(
      body.userId,
      body.challengeId,
      body.decryptedChallenge,
    );

    if (!isValid) {
      throw new BadRequestException('Challenge verification failed');
    }

    // Generiere JWT Token
    const token = await this.twoFaService.generateLoginToken(body.userId);

    return {
      success: true,
      message: 'Challenge verified! You are now logged in.',
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      user: token.user,
    };
  }

  /**
   * GET /api/two-fa/status
   * Prüfe ob 2FA aktiviert ist
   */
  @Get('status')
  @UseGuards(AuthGuard('jwt'))
  async getTwoFaStatus(@Request() req: any) {
    const userId = req.user.userId;
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
    const userId = req.user.userId;
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