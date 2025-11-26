import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateCareRecordDto } from './dto/care-record.dto';

@Injectable()
export class CareRecordsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCareRecordDto) {
    return this.prisma.careRecord.create({
      data: {
        plantId: dto.plantId,
        type: dto.type,
        date: dto.date || new Date(),
        notes: dto.notes,
      },
    });
  }

  async findByPlant(plantId: string) {
    return this.prisma.careRecord.findMany({
      where: { plantId },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.careRecord.findUnique({
      where: { id },
      include: {
        plant: true,
      },
    });
  }
}
