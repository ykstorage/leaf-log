import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private prisma: PrismaService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, emails, displayName, photos } = profile;
    const email = emails[0].value;

    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { provider: 'google', providerId: id },
        ],
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          nickname: displayName || email.split('@')[0],
          profileImageUrl: photos?.[0]?.value,
          provider: 'google',
          providerId: id,
        },
      });
    }

    done(null, user);
  }
}
