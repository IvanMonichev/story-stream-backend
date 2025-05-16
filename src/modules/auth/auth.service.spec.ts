import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { UserEntity } from '@/modules/user/entities/user.entity';
import { AuthService } from './auth.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { checkPassword } from '@/constants/password';
import { FastifyRequestWithUser } from '@/modules/auth/auth.types';

// Mock the external checkPassword function
jest.mock('@/constants/password', () => ({
  checkPassword: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let userRepository: Repository<UserEntity>;
  const mockedCheckPassword = checkPassword as jest.MockedFunction<typeof checkPassword>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mocked-access-token'),
          },
        },
        {
          provide: 'UserEntityRepository',
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get<Repository<UserEntity>>('UserEntityRepository');

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('registerTokens', () => {
    it('should return access token for valid user', async () => {
      const mockUser = { id: 1, username: 'testuser' } as UserEntity;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      process.env.JWT_ACCESS_EXPIRE = '1h';

      const result = await authService.registerTokens(mockUser);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(jwtService.sign).toHaveBeenCalledWith(
        { id: mockUser.id, username: mockUser.username },
        { expiresIn: '1h' },
      );
      expect(result).toEqual({ accessToken: 'mocked-access-token' });
    });

    it('should return undefined if user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      const mockUser = { id: 999, username: 'nonexistent' } as UserEntity;

      const result = await authService.registerTokens(mockUser);

      expect(result).toBeUndefined();
    });
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        password: 'hashed-password',
      } as UserEntity;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      mockedCheckPassword.mockResolvedValue(true);

      const result = await authService.validateUser({
        login: 'testuser',
        password: 'correct-password',
      });

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'testuser' },
        select: { id: true, password: true },
      });
      expect(mockedCheckPassword).toHaveBeenCalledWith('correct-password', 'hashed-password');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(
        authService.validateUser({
          login: 'nonexistent',
          password: 'any-password',
        }),
      ).rejects.toThrow(NotFoundException);
      expect(mockedCheckPassword).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if password is invalid', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        password: 'hashed-password',
      } as UserEntity;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      mockedCheckPassword.mockResolvedValue(false);

      await expect(
        authService.validateUser({
          login: 'testuser',
          password: 'wrong-password',
        }),
      ).rejects.toThrow(BadRequestException);
      expect(mockedCheckPassword).toHaveBeenCalledWith('wrong-password', 'hashed-password');
    });
  });

  describe('login', () => {
    it('should call registerTokens with user from request', async () => {
      const mockUser = { id: 1, username: 'testuser' } as UserEntity;
      const mockReq = { user: mockUser };
      const mockTokens = { accessToken: 'mocked-access-token' };

      jest.spyOn(authService, 'registerTokens').mockResolvedValue(mockTokens);

      const result = await authService.login(mockReq as FastifyRequestWithUser);

      expect(authService.registerTokens).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockTokens);
    });
  });
});
