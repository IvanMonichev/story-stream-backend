import { SWAGGER_CONFIG } from '@/configs/swagger.config';

describe('SWAGGER_CONFIG', () => {
  it('should be defined', () => {
    expect(SWAGGER_CONFIG).toBeDefined();
  });

  it('should have correct title', () => {
    expect(SWAGGER_CONFIG.info.title).toBe('Story Stream API');
  });

  it('should have correct description', () => {
    expect(SWAGGER_CONFIG.info.description).toBe(
      'API для простого RESTful блог-сервиса, который позволит пользователям публиковать, редактировать, удалять и просматривать записи.',
    );
  });

  it('should have correct version', () => {
    expect(SWAGGER_CONFIG.info.version).toBe('1.0.0');
  });
});
