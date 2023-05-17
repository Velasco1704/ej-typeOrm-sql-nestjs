import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateProfileDto } from './dto/create-profile.dto';
import { Profile } from './entities/profile.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Profile) private profileRepository: Repository<Profile>,
  ) {}

  getUsers() {
    return this.userRepository.find({
      relations: ['posts', 'profile'],
    });
  }

  async getUser(id: number) {
    const foundUser = await this.userRepository.findOne({
      where: {
        id,
      },
      relations: ['posts', 'profile'],
    });
    if (!foundUser)
      throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    else return foundUser;
  }

  async createUser(user: CreateUserDto) {
    const foundUser = await this.userRepository.findOne({
      where: {
        username: user.username,
      },
    });
    if (foundUser)
      throw new HttpException('USER_ALREADY_EXITS', HttpStatus.CONFLICT);
    const newUser = this.userRepository.create(user);
    return this.userRepository.save(newUser);
  }

  async deleteUser(id: number) {
    const res = await this.userRepository.delete({ id });
    if (res.affected === 0)
      throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    else return res;
  }

  async update(id: number, objectUser: UpdateUserDto) {
    const foundUser = await this.userRepository.findOneBy({ id });
    if (!foundUser)
      throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    const updateUser = Object.assign(foundUser, objectUser);
    return this.userRepository.save(updateUser);
  }

  async createProfile(id: number, profile: CreateProfileDto) {
    const foundUser = await this.userRepository.findOneBy({ id });
    if (!foundUser)
      throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    const newProfile = this.profileRepository.create(profile);
    const savedProfile = await this.profileRepository.save(newProfile);
    foundUser.profile = savedProfile;
    return this.userRepository.save(foundUser);
  }
}
