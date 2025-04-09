import { ValidationPipe } from '@nestjs/common';

export const VALIDATION_PIPE = new ValidationPipe({
  transform: true,
});
