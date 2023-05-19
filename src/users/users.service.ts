import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateProfileDto } from './dto/create-profile.dto';
import { Profile } from './entities/profile.entity';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Profile) private profileRepository: Repository<Profile>,
    private jwtService: JwtService,
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
    const plainToHash = await hash(user.password, 10);
    user = { ...user, password: plainToHash };
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

  async login(objectLogin: CreateUserDto) {
    const foundUser = await this.userRepository.findOne({
      where: {
        username: objectLogin.username,
      },
    });
    if (!foundUser)
      throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    const checkPassword = await compare(
      objectLogin.password,
      foundUser.password,
    );
    if (!checkPassword)
      throw new HttpException('PASSWORD__INCORRECT', HttpStatus.NOT_ACCEPTABLE);
    const payload = { id: foundUser.id, name: foundUser.username };
    const token = this.jwtService.sign(payload);
    return {
      user: foundUser,
      token,
    };
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
