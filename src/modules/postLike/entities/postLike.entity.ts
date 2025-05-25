import { PostEntity } from '@/modules/post/entities/post.entity';
import { UserEntity } from '@/modules/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('post_likes')
export class PostLikeEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: () => UserEntity })
  @ManyToOne(() => UserEntity, (user: UserEntity) => user.likes)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'user_id', nullable: false })
  userId: number;

  @ApiProperty({ type: () => PostEntity })
  @ManyToOne(() => PostEntity, (post: PostEntity) => post.likes)
  @JoinColumn({ name: 'post_id' })
  post: PostEntity;

  @Column({ name: 'post_id', nullable: false })
  postId: number;
}
