import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class LikesService {
  constructor(private prisma: PrismaService) {}

  async toggleLike(postId: string, userId: string) {
    // Check if post exists
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check if like already exists
    const existingLike = await this.prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingLike) {
      // Unlike: Remove the like
      await this.prisma.like.delete({
        where: { id: existingLike.id },
      });

      return {
        liked: false,
        message: 'Post unliked',
      };
    } else {
      // Like: Create a new like
      await this.prisma.like.create({
        data: {
          userId,
          postId,
        },
      });

      return {
        liked: true,
        message: 'Post liked',
      };
    }
  }

  async getLikeCount(postId: string) {
    const count = await this.prisma.like.count({
      where: { postId },
    });

    return { count };
  }

  async isLikedByUser(postId: string, userId: string) {
    const like = await this.prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    return { isLiked: !!like };
  }
}
