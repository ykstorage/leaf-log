import { Module } from '@nestjs/common';
import { PlantsController } from './plants.controller';
import { PlantsService } from './plants.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [PlantsController],
  providers: [PlantsService, PrismaService]
})
export class PlantsModule {}
