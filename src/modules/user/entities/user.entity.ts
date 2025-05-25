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

  @ApiProperty({ type: () => PostEntity })
  @OneToMany(() => PostEntity, (post: PostEntity) => post.user)
  posts: PostEntity[];

  @ApiProperty({ type: () => CommentEntity })
  @OneToMany(() => CommentEntity, (comment: CommentEntity) => comment.user)
  comments: CommentEntity[];

  @ApiProperty({ type: () => PostLikeEntity })
  @OneToMany(() => PostLikeEntity, (like: PostLikeEntity) => like.user)
  likes: PostLikeEntity[];
}
