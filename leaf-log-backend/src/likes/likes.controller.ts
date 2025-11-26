import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('posts/:postId/like')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async toggleLike(@Param('postId') postId: string, @CurrentUser() user: any) {
    return this.likesService.toggleLike(postId, user.id);
  }
}
