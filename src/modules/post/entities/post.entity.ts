import {
  UpdateDateColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { UserEntity } from '@/modules/user/entities/user.entity'; // Обычный импорт (если нет цикла)
import { CommentEntity } from '@/modules/comment/entities/comment.entity'; // Обычный импорт (если нет цикла)
import { PostLikeEntity } from '@/modules/postLike/entities/postLike.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('posts')
export class PostEntity {
  @ApiProperty({ example: 1, description: 'Post ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Post Title', description: 'Title of the post' })
  @Column()
  title: string;

  @ApiProperty({ example: 'Post content', description: 'Body of the post' })
  @Column()
  body: string;

  @ApiProperty({ type: () => PostLikeEntity, isArray: true, description: 'Likes of the post' })
  @OneToMany(() => PostLikeEntity, (like) => like.post)
  likes: PostLikeEntity[];

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z', description: 'Creation date' })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: false,
  })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z', description: 'Last update date' })
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: false,
  })
  updatedAt: Date;

  @ApiProperty({ example: null, description: 'Deletion date (soft delete)', nullable: true })
  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', default: null, nullable: true })
  deletedAt: Date | null;

  @ApiProperty({ type: () => UserEntity, description: 'Author of the post' })
  @ManyToOne(() => UserEntity, (user) => user.posts)
  user: UserEntity;

  @ApiProperty({ type: () => CommentEntity, isArray: true, description: 'Comments on the post' })
  @OneToMany(() => CommentEntity, (comment) => comment.post)
  comments: CommentEntity[];
}
