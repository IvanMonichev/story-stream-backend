import { Test } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;

  beforeEach(async () => {
    process.env.JWT_SECRET = 'test-secret';

    const module = await Test.createTestingModule({
      providers: [JwtStrategy],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(jwtStrategy).toBeDefined();
  });

  it('should have validate method', () => {
    expect(jwtStrategy.validate).toBeDefined();
    expect(typeof jwtStrategy.validate).toBe('function');
  });

  describe('validate()', () => {
    it('should return user when payload is valid', async () => {
      const payload = { id: 1, username: 'testuser' };
      const result = await jwtStrategy.validate(payload);
      expect(result).toEqual(payload);
    });

    it('should throw Unauthorized when payload is null', async () => {
      await expect(jwtStrategy.validate(null)).rejects.toThrow(
        new HttpException('Токен истек или недействителен', HttpStatus.UNAUTHORIZED),
      );
    });

    it('should throw Unauthorized when payload is missing fields', async () => {
      await expect(jwtStrategy.validate({})).rejects.toThrow(
        new HttpException('Токен истек или недействителен', HttpStatus.UNAUTHORIZED),
      );
      await expect(jwtStrategy.validate({ id: 1 })).rejects.toThrow();
      await expect(jwtStrategy.validate({ username: 'test' })).rejects.toThrow();
    });
  });

  it('should fail if JWT_SECRET is missing', async () => {
    delete process.env.JWT_SECRET;
    await expect(async () => {
      const module = await Test.createTestingModule({
        providers: [JwtStrategy],
      }).compile();
      module.get<JwtStrategy>(JwtStrategy);
    }).rejects.toThrow();
  });
});
