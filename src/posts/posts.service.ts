import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UsersService } from 'src/users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
    private usersService: UsersService,
  ) {}

  async createPost(post: CreatePostDto) {
    const foundUser = await this.usersService.getUser(post.authorId);
    if (!foundUser)
      throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    const newPost = this.postRepository.create(post);
    return this.postRepository.save(newPost);
  }

  getPosts() {
    return this.postRepository.find({
      relations: ['author'],
    });
  }
}
