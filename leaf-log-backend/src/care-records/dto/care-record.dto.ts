import { CareType } from '@prisma/client';

export class CreateCareRecordDto {
  plantId: string;
  type: CareType;
  date?: Date;
  notes?: string;
}
