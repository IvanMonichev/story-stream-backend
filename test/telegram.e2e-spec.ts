import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TelegramController } from '@/modules/telegram/telegram.controller';

describe('TelegramController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TelegramController],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/telegram (GET) should return 404 (Not Found) if no routes defined', () => {
    return request(app.getHttpServer()).get('/telegram').expect(404);
  });

  // Когда появятся методы в контроллере, добавляй тесты для них
});
