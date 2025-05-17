import type { PostEntity } from '@/modules/post/entities/post.entity';
import type { UserEntity } from '@/modules/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('post_likes')
export class PostLikeEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @ManyToOne('UserEntity', (user: UserEntity) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'user_id', nullable: false })
  userId: number;

  @ApiProperty()
  @ManyToOne('PostEntity', (post: PostEntity) => post.id)
  @JoinColumn({ name: 'post_id' })
  post: PostEntity;

  @Column({ name: 'post_id', nullable: false })
  postId: number;
}
