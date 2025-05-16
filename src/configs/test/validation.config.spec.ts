import { VALIDATION_PIPE } from '@/configs/validation.config';
import { ValidationPipe, ArgumentMetadata } from '@nestjs/common';

class TestDto {
  prop: number;
}

describe('validation.config', () => {
  it('should export ValidationPipe instance with transform enabled', async () => {
    expect(VALIDATION_PIPE).toBeInstanceOf(ValidationPipe);

    const value = { prop: 123 };
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: TestDto,
      data: '',
    };

    const result = await VALIDATION_PIPE.transform(value, metadata);
    expect(result).toBeInstanceOf(TestDto);
    expect(typeof result.prop).toBe('number');
    expect(result.prop).toBe(123);
  });
});
