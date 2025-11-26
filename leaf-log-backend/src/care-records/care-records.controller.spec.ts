import { Test, TestingModule } from '@nestjs/testing';
import { CareRecordsController } from './care-records.controller';

describe('CareRecordsController', () => {
  let controller: CareRecordsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CareRecordsController],
    }).compile();

    controller = module.get<CareRecordsController>(CareRecordsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
