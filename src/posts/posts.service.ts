import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UsersService } from 'src/users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { UpdatePostDto } from './dto/update-post.dto';

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

  async getPost(id: number) {
    const foundPost = await this.postRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!foundPost)
      throw new HttpException('POST_NOT_FOUND', HttpStatus.NOT_FOUND);
    else return foundPost;
  }

  async updatePost(id: number, objectPost: UpdatePostDto) {
    const foundPost = await this.postRepository.findOne({
      where: {
        id,
      },
      relations: ['author'],
    });
    if (!foundPost)
      throw new HttpException('POST_NOT_FOUND', HttpStatus.NOT_FOUND);
    const updatePost = Object.assign(foundPost, objectPost);
    return this.postRepository.save(updatePost);
  }

  async delete(id: number) {
    const res = await this.postRepository.delete({ id });
    if (res.affected === 0)
      throw new HttpException('POST_NOT_FOUND', HttpStatus.NOT_FOUND);
    else return res;
  }
}
