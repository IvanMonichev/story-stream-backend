import { Test } from '@nestjs/testing';
import { LocalStrategy } from './local.strategy';
import { AuthService } from '@/modules/auth/auth.service';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { BadRequestException } from '@nestjs/common';

describe('LocalStrategy', () => {
  let localStrategy: LocalStrategy;
  let authService: jest.Mocked<AuthService>;

  const mockUser = {
    id: 1,
    username: 'Test',
    bio: 'test',
    posts: [],
    comments: [],
    likes: [],
    password: 'hashedpassword',
  };

  beforeEach(async () => {
    const authServiceMock = {
      validateUser: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [LocalStrategy, { provide: AuthService, useValue: authServiceMock }],
    }).compile();

    localStrategy = module.get<LocalStrategy>(LocalStrategy);
    authService = module.get(AuthService) as jest.Mocked<AuthService>;
  });

  it('should be defined', () => {
    expect(localStrategy).toBeDefined();
  });

  it('should be a passport strategy', () => {
    // Проверяем наличие обязательных методов
    expect(localStrategy.validate).toBeDefined();
    expect(typeof localStrategy.validate).toBe('function');

    // Проверяем, что стратегия имеет нужное имя (если важно)
    expect(localStrategy.name).toBe('local');
  });

  describe('validate', () => {
    it('should return user when credentials are valid', async () => {
      authService.validateUser.mockResolvedValue(mockUser);

      const result = await localStrategy.validate('testuser', 'password');
      expect(result).toEqual(mockUser);
      expect(authService.validateUser).toHaveBeenCalledWith({
        login: 'testuser',
        password: 'password',
      });
    });

    it('should throw BadRequestException when credentials are invalid', async () => {
      // authService.validateUser.mockResolvedValue(null); // или undefined

      await expect(localStrategy.validate('wronguser', 'wrongpass')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when authService throws', async () => {
      authService.validateUser.mockRejectedValue(new BadRequestException());

      await expect(localStrategy.validate('testuser', 'password')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
