import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from '@/modules/user/dto/createUser.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty()
  bio: string;
}
