import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import type { PostEntity } from '@/modules/post/entities/post.entity';
import type { CommentEntity } from '@/modules/comment/entities/comment.entity';
import type { PostLikeEntity } from '@/modules/postLike/entities/postLike.entity';

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
  @OneToMany('PostEntity', 'user')
  posts: Relation<PostEntity[]>;

  @ApiProperty()
  @OneToMany('CommentEntity', 'user')
  comments: Relation<CommentEntity[]>;

  @ApiProperty()
  @OneToMany('PostLikeEntity', 'user')
  likes: Relation<PostLikeEntity[]>;
}
