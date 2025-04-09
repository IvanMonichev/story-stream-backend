import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '@/modules/user/entities/user.entity';
import { hash } from 'bcrypt';
import { CreateUserDto } from '@/modules/user/dto/createUser.dto';
import { UpdateUserDto } from '@/modules/user/dto/updateUser.dto';
import { omit } from 'lodash';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { username, password } = createUserDto;

    const existingUser = await this.userRepository.findOneBy({ username });

    if (existingUser) {
      throw new HttpException(`Username: ${username} - already exists`, HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await hash(password, 10);

    const newUser = await this.userRepository.save({ username, password: hashedPassword });

    return {
      ...omit(newUser, ['password']),
    };
  }

  async findOne(id: number) {
    return this.userRepository.findOneBy({ id });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const existingUser = await this.userRepository.findOneBy({ id });

    if (!existingUser) {
      throw new HttpException(`No user with this id = ${id} was found`, HttpStatus.BAD_REQUEST);
    }

    await this.userRepository.update(id, { ...updateUserDto });
  }
}
