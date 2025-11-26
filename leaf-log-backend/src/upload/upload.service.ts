import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    const region = this.configService.get('AWS_REGION') || 'ap-northeast-2';
    const endpoint = this.configService.get('AWS_ENDPOINT'); // For LocalStack

    this.s3Client = new S3Client({
      region,
      ...(endpoint && { endpoint }),
    });

    this.bucketName = this.configService.get('S3_BUCKET') || 'leaf-log-images-local';
  }

  async generatePresignedUrl(
    fileName: string,
    fileType: string,
  ): Promise<{ uploadUrl: string; fileUrl: string; key: string }> {
    const key = `plants/${uuidv4()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: fileType,
    });

    // Generate presigned URL valid for 5 minutes
    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 300,
    });

    // Construct the final file URL
    const fileUrl = `https://${this.bucketName}.s3.${this.configService.get('AWS_REGION') || 'ap-northeast-2'}.amazonaws.com/${key}`;

    return {
      uploadUrl,
      fileUrl,
      key,
    };
  }
}
