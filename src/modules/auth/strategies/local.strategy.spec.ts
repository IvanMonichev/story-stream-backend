import { Test, TestingModule } from '@nestjs/testing';
import { LocalStrategy } from './local.strategy';
import { AuthService } from '@/modules/auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let authService: AuthService;

  const mockConfigService = {
    get: jest.fn().mockImplementation((key) => {
      if (key === 'FIELD_NAME') return 'password';
    }),
  };

  const mockAuthService = {
    validateUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        { provide: AuthService, useValue: mockAuthService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should validate and return a user if credentials are valid', async () => {
    const mockUser = { id: 1, login: 'testuser' };
    mockAuthService.validateUser.mockResolvedValueOnce(mockUser);

    const result = await strategy.validate('testuser', 'testpass');

    expect(result).toEqual(mockUser);
    expect(mockAuthService.validateUser).toHaveBeenCalledWith({
      login: 'testuser',
      password: 'testpass',
    });
  });

  it('should throw BadRequestException if user is not valid', async () => {
    mockAuthService.validateUser.mockResolvedValueOnce(null);

    await expect(strategy.validate('invalid', 'wrongpass')).rejects.toThrow(BadRequestException);
  });
});
