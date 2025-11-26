import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PlantsService } from './plants.service';
import { CreatePlantDto, UpdatePlantDto } from './dto/plant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('plants')
@UseGuards(JwtAuthGuard)
export class PlantsController {
  constructor(private readonly plantsService: PlantsService) {}

  @Post()
  async createPlant(@Body() dto: CreatePlantDto, @CurrentUser() user: any) {
    return this.plantsService.create(dto, user.id);
  }

  @Get()
  async getPlants(@CurrentUser() user: any) {
    return this.plantsService.findAll(user.id);
  }

  @Get(':id')
  async getPlant(@Param('id') id: string, @CurrentUser() user: any) {
    return this.plantsService.findOne(id, user.id);
  }

  @Put(':id')
  async updatePlant(
    @Param('id') id: string,
    @Body() dto: UpdatePlantDto,
    @CurrentUser() user: any,
  ) {
    return this.plantsService.update(id, dto, user.id);
  }

  @Delete(':id')
  async deletePlant(@Param('id') id: string, @CurrentUser() user: any) {
    return this.plantsService.delete(id, user.id);
  }
}
