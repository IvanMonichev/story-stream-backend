import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from '@/modules/post/dto/createPost.dto';

export class UpdatePostDto extends PartialType(CreatePostDto) {}
