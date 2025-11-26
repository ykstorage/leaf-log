import { Controller, Post, Body } from '@nestjs/common';
import { UploadService } from './upload.service';

class GeneratePresignedUrlDto {
  fileName: string;
  fileType: string;
}

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('presigned-url')
  async generatePresignedUrl(@Body() dto: GeneratePresignedUrlDto) {
    return this.uploadService.generatePresignedUrl(dto.fileName, dto.fileType);
  }
}
