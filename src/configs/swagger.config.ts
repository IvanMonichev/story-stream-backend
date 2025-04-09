import { DocumentBuilder } from '@nestjs/swagger';

export const SWAGGER_CONFIG = new DocumentBuilder()
  .setTitle('Story Stream API')
  .setDescription(
    'API для простого RESTful блог-сервиса, который позволит пользователям публиковать, редактировать, удалять и просматривать записи.',
  )
  .setVersion('2025.0.1')
  .build();
