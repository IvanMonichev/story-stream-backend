import type { PostEntity } from '@/modules/post/entities/post.entity';
import type { UserEntity } from '@/modules/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('comments')
export class CommentEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  text: string;

  @ApiProperty()
  @ManyToOne('UserEntity', (user: UserEntity) => user.id)
  user: UserEntity;

  @ApiProperty()
  @ManyToOne('PostEntity', (post: PostEntity) => post.id)
  post: PostEntity;
}
