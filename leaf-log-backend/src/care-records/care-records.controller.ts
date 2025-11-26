import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { CareRecordsService } from './care-records.service';
import { CreateCareRecordDto } from './dto/care-record.dto';

@Controller('care-records')
export class CareRecordsController {
  constructor(private readonly careRecordsService: CareRecordsService) {}

  @Post()
  async createRecord(@Body() dto: CreateCareRecordDto) {
    return this.careRecordsService.create(dto);
  }

  @Get('plant/:plantId')
  async getPlantRecords(@Param('plantId') plantId: string) {
    return this.careRecordsService.findByPlant(plantId);
  }

  @Get(':id')
  async getRecord(@Param('id') id: string) {
    return this.careRecordsService.findOne(id);
  }
}
