import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUser = {
    id: 1,
    username: 'testuser',
  };

  const mockRequest = {
    user: mockUser,
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn().mockResolvedValue({
              accessToken: 'mock-access-token',
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return access token', async () => {
      const result = await controller.login(mockRequest);

      expect(authService.login).toHaveBeenCalledWith(mockRequest);
      expect(result).toEqual({
        accessToken: 'mock-access-token',
      });
    });

    it('should use LocalAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', AuthController.prototype.login);
      const guard = new guards[0]();

      expect(guard).toBeInstanceOf(LocalAuthGuard);
    });
  });

  describe('healthCheck', () => {
    it('should return user data', async () => {
      // Добавлен async
      const result = await controller.healthCheck(mockRequest); // Добавлен await

      expect(result).toEqual(mockUser);
    });

    it('should use JwtAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', AuthController.prototype.healthCheck);
      const guard = new guards[0]();

      expect(guard).toBeInstanceOf(JwtAuthGuard);
    });
  });
});
