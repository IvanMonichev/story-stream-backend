import type { PostEntity } from '@/modules/post/entities/post.entity';
import type { UserEntity } from '@/modules/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('post_likes')
export class PostLikeEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @ManyToOne('UserEntity', 'likes')
  @JoinColumn({ name: 'user_id' })
  user: Relation<UserEntity>;

  @Column({ name: 'user_id', nullable: false })
  userId: number;

  @ApiProperty()
  @ManyToOne('PostEntity', 'likes')
  @JoinColumn({ name: 'post_id' })
  post: Relation<PostEntity>;

  @Column({ name: 'post_id', nullable: false })
  postId: number;
}
