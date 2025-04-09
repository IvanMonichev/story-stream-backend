import { PostEntity } from '@/modules/post/entities/post.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CommentEntity } from '@/modules/comment/entities/comment.entity';
import { PostLikeEntity } from '@/modules/postLike/entities/postLike.entity';
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
  @OneToMany(() => PostEntity, (post) => post.user)
  posts: PostEntity[];

  @ApiProperty()
  @OneToMany(() => CommentEntity, (comment) => comment.user)
  comments: CommentEntity[];

  @ApiProperty()
  @OneToMany(() => PostLikeEntity, (like) => like.user)
  likes: PostLikeEntity[];
}
