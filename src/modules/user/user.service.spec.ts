import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository, UpdateResult } from 'typeorm';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockImplementation(async (pwd) => `hashed-${pwd}`),
}));

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<Repository<UserEntity>>;

  const mockRepository = () => ({
    findOneBy: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(getRepositoryToken(UserEntity));
  });

  describe('create', () => {
    it('should throw if user exists', async () => {
      const dto: CreateUserDto = { username: 'john', password: '1234' };
      userRepository.findOneBy.mockResolvedValue({ id: 1, username: 'john' } as UserEntity);

      await expect(service.create(dto)).rejects.toThrow(
        new HttpException(`Username: john - already exists`, HttpStatus.BAD_REQUEST),
      );
    });

    it('should hash password and create user', async () => {
      const dto: CreateUserDto = { username: 'jane', password: 'pass' };
      userRepository.findOneBy.mockResolvedValue(null);
      userRepository.save.mockResolvedValue({
        id: 1,
        username: 'jane',
        bio: 'test',
        password: 'password',
        posts: [],
        comments: [],
        likes: [],
      });

      const result = await service.create(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith('pass', 10);
      expect(userRepository.save).toHaveBeenCalledWith({
        username: 'jane',
        password: 'hashed-pass',
      });
      expect(result).toEqual({
        id: 1,
        username: 'jane',
        bio: 'test',
        comments: [],
        likes: [],
        posts: [],
      });
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      const user = { id: 1, username: 'john' } as UserEntity;
      userRepository.findOneBy.mockResolvedValue(user);

      const result = await service.findOne(1);

      expect(result).toBe(user);
    });
  });

  describe('update', () => {
    it('should throw if user does not exist', async () => {
      userRepository.findOneBy.mockResolvedValue(null);

      await expect(service.update(99, { bio: 'new' })).rejects.toThrow(
        new HttpException(`No user with this id = 99 was found`, HttpStatus.BAD_REQUEST),
      );
    });

    it('should update user if exists', async () => {
      const existing = { id: 2, username: 'user' } as UserEntity;
      const dto: UpdateUserDto = { bio: 'updated' };

      userRepository.findOneBy.mockResolvedValue(existing);
      userRepository.update.mockResolvedValue({
        affected: 1,
        generatedMaps: [],
        raw: [],
      } as UpdateResult);
      await service.update(2, dto);

      expect(userRepository.update).toHaveBeenCalledWith(2, dto);
    });
  });
});
