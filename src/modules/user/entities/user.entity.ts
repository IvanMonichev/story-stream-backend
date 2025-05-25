import type { PostEntity } from '@/modules/post/entities/post.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { CommentEntity } from '@/modules/comment/entities/comment.entity';
import type { PostLikeEntity } from '@/modules/postLike/entities/postLike.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users')
export class UserEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  username: string;

  @ApiProperty()
  @Column({ nullable: true, default: null })
  bio: string;

  @ApiProperty()
  @Column({ select: false })
  password: string;

  @ApiProperty()
  @OneToMany('PostEntity', (post: PostEntity) => post.user)
  posts: PostEntity[];

  @ApiProperty()
  @OneToMany('CommentEntity', (comment: CommentEntity) => comment.user)
  comments: CommentEntity[];

  @ApiProperty()
  @OneToMany('PostLikeEntity', (like: PostLikeEntity) => like.user)
  likes: PostLikeEntity[];
}
