import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { LoadModule } from '@/modules/load/load.module';
import { LoadService } from '@/modules/load/load.service';

describe('LoadController (e2e)', () => {
  let app: INestApplication;
  const loadService = { simulateCpu: () => {} };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [LoadModule],
    })
      .overrideProvider(LoadService)
      .useValue(loadService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/load/cpu (GET)', () => {
    it('should simulate CPU load', () => {
      jest.spyOn(loadService, 'simulateCpu');

      return request(app.getHttpServer())
        .get('/load/cpu')
        .expect(200)
        .expect('CPU load completed')
        .then(() => {
          expect(loadService.simulateCpu).toHaveBeenCalled();
        });
    });
  });
});
