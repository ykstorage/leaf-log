import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePlantDto, UpdatePlantDto } from './dto/plant.dto';

@Injectable()
export class PlantsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePlantDto, userId: string) {
    return this.prisma.plant.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.plant.findMany({
      where: { userId },
      include: {
        careRecords: {
          take: 10,
          orderBy: { date: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const plant = await this.prisma.plant.findUnique({
      where: { id },
      include: {
        careRecords: {
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!plant) {
      throw new NotFoundException('Plant not found');
    }

    if (plant.userId !== userId) {
      throw new ForbiddenException('You can only access your own plants');
    }

    return plant;
  }

  async update(id: string, dto: UpdatePlantDto, userId: string) {
    const plant = await this.prisma.plant.findUnique({
      where: { id },
    });

    if (!plant) {
      throw new NotFoundException('Plant not found');
    }

    if (plant.userId !== userId) {
      throw new ForbiddenException('You can only update your own plants');
    }

    return this.prisma.plant.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string, userId: string) {
    const plant = await this.prisma.plant.findUnique({
      where: { id },
    });

    if (!plant) {
      throw new NotFoundException('Plant not found');
    }

    if (plant.userId !== userId) {
      throw new ForbiddenException('You can only delete your own plants');
    }

    return this.prisma.plant.delete({
      where: { id },
    });
  }
}
