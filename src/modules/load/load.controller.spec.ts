import { Test, TestingModule } from '@nestjs/testing';
import { LoadController } from './load.controller';
import { LoadService } from './load.service';

describe('LoadController', () => {
  let controller: LoadController;
  let loadService: LoadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoadController],
      providers: [
        {
          provide: LoadService,
          useValue: {
            simulateCpu: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<LoadController>(LoadController);
    loadService = module.get<LoadService>(LoadService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('simulateCpuLoad', () => {
    it('should call loadService.simulateCpu and return success message', async () => {
      const result = await controller.simulateCpuLoad();

      expect(loadService.simulateCpu).toHaveBeenCalled();
      expect(result).toBe('CPU load completed');
    });
  });
});
