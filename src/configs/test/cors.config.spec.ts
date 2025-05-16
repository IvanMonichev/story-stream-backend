import { CORS_OPTIONS } from '@/configs/cors.config';

describe('CORS_OPTIONS config', () => {
  it('should be defined', () => {
    expect(CORS_OPTIONS).toBeDefined();
  });

  it('should have correct origin', () => {
    expect(CORS_OPTIONS.origin).toBe('*');
  });

  it('should have correct methods', () => {
    expect(CORS_OPTIONS.methods).toEqual(['GET', 'HEAD', 'PATCH', 'POST', 'DELETE']);
  });

  it('should have preflightContinue as false', () => {
    expect(CORS_OPTIONS.preflightContinue).toBe(false);
  });
});
