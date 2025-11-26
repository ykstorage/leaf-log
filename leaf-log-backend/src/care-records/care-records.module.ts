import { Module } from '@nestjs/common';
import { CareRecordsController } from './care-records.controller';
import { CareRecordsService } from './care-records.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [CareRecordsController],
  providers: [CareRecordsService, PrismaService]
})
export class CareRecordsModule {}
