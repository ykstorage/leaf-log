import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(private prisma: PrismaService) {
    super({
      clientID: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
      callbackURL: process.env.KAKAO_CALLBACK_URL,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): Promise<any> {
    const { id, username, _json } = profile;
    const email = _json.kakao_account?.email || `kakao_${id}@leaf-log.local`;
    const nickname = _json.kakao_account?.profile?.nickname || username || `User${id}`;
    const profileImageUrl = _json.kakao_account?.profile?.profile_image_url;

    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { provider: 'kakao', providerId: String(id) },
        ],
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          nickname,
          profileImageUrl,
          provider: 'kakao',
          providerId: String(id),
        },
      });
    }

    done(null, user);
  }
}
