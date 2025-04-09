import { DataSource } from 'typeorm';
import { UserEntity } from '@/modules/user/entities/user.entity';
import { PostEntity } from '@/modules/post/entities/post.entity';
import { PostLikeEntity } from '@/modules/postLike/entities/postLike.entity';
import { CommentEntity } from '@/modules/comment/entities/comment.entity';
import { faker } from '@faker-js/faker';
import { dataSourceConfig } from '@/configs/typeorm.config';
import { hash } from 'bcrypt';

const AppDataSource = new DataSource({
  ...dataSourceConfig,
  entities: [UserEntity, PostEntity, PostLikeEntity, CommentEntity],
});

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Connected to the database');

    await AppDataSource.query('TRUNCATE TABLE "users" CASCADE');
    await AppDataSource.query('TRUNCATE TABLE "posts" CASCADE');
    await AppDataSource.query('TRUNCATE TABLE "comments" CASCADE');
    await AppDataSource.query('TRUNCATE TABLE "post_likes" CASCADE');

    const uniqPass = 'password';
    const usernames = ['AlexRise', 'CoreWave', 'Nexora', 'LiamFrost', 'ZenithFlow'];

    const users: UserEntity[] = [];
    for (let i = 0; i < 5; i++) {
      const user = new UserEntity();
      user.username = usernames[i];
      user.password = await hash(uniqPass, 10);
      users.push(user);
    }

    const savedUsers = await AppDataSource.getRepository(UserEntity).save(users);

    const posts: PostEntity[] = [];
    savedUsers.forEach((user) => {
      for (let i = 0; i < 3; i++) {
        const post = new PostEntity();
        post.title = faker.lorem.sentence();
        post.body = faker.lorem.paragraph();
        post.user = user;
        posts.push(post);
      }
    });

    const savedPosts = await AppDataSource.getRepository(PostEntity).save(posts);

    const comments: CommentEntity[] = [];
    savedPosts.forEach((post) => {
      for (let i = 0; i < 3; i++) {
        const comment = new CommentEntity();
        comment.text = faker.lorem.sentence();
        comment.post = post;
        comments.push(comment);
      }
    });

    await AppDataSource.getRepository(CommentEntity).save(comments);

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

seed();
