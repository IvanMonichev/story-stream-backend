import {
  UpdateDateColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  Relation,
} from 'typeorm';
import type { UserEntity } from '@/modules/user/entities/user.entity';
import type { CommentEntity } from '@/modules/comment/entities/comment.entity';
import type { PostLikeEntity } from '@/modules/postLike/entities/postLike.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('posts')
export class PostEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  title: string;

  @ApiProperty()
  @Column()
  body: string;

  @ApiProperty()
  @OneToMany('PostLikeEntity', 'post')
  likes: Relation<PostLikeEntity[]>;

  @ApiProperty()
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: false,
  })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: false,
  })
  updatedAt: Date;

  @ApiProperty()
  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', default: null, nullable: true })
  deletedAt: Date;

  @ApiProperty()
  @ManyToOne('UserEntity', 'posts')
  user: Relation<UserEntity>;

  @ApiProperty()
  @OneToMany('CommentEntity', 'post')
  comments: Relation<CommentEntity[]>;
}
