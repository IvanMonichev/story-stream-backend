import { LoadModule } from '@/modules/load/load.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from '@/configs/typeorm.config';
import { UserModule } from '@/modules/user/user.module';
import { PostModule } from '@/modules/post/post.module';
import { CommentModule } from '@/modules/comment/comment.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { TelegramModule } from './modules/telegram/telegram.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),

    AuthModule,
    CommentModule,
    PostModule,
    UserModule,
    LoadModule,
    TelegramModule,
  ],
  providers: [],
})
export class AppModule {}
