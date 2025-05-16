import { Test, TestingModule } from '@nestjs/testing';
import { LoadService } from './load.service';

describe('LoadService', () => {
  let service: LoadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoadService],
    }).compile();

    service = module.get<LoadService>(LoadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('simulateCpu should run and call console.log', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    service.simulateCpu();

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
