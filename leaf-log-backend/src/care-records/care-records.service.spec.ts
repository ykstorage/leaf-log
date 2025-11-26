import { Test, TestingModule } from '@nestjs/testing';
import { CareRecordsService } from './care-records.service';

describe('CareRecordsService', () => {
  let service: CareRecordsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CareRecordsService],
    }).compile();

    service = module.get<CareRecordsService>(CareRecordsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
