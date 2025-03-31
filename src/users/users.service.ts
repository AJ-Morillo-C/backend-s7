import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository, UpdateResult } from 'typeorm';
import { ManagerError } from 'src/common/errors/manager.error';
import { PaginationDto } from 'src/common/dtos/pagination/pagination.dto';
import { AllApiResponse, OneApiResponse } from 'src/common/interfaces/response-api.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    try {
      const user = await this.userRepository.save(createUserDto);
      if (!user) {
        throw new ManagerError({
          type: 'CONFLICT',
          message: 'user not created!',
        });
      }
      return user;
    } catch (error) {
      ManagerError.createSignatureError(error.message);
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<AllApiResponse<UserEntity>> {
    const { limit, page } = paginationDto;
    const skip = (page - 1) * limit;
    try {
      const [total, data] = await Promise.all([
        this.userRepository.count({ where: { isActive: true } }),
        this.userRepository
          .createQueryBuilder('user')
          .where({ isActive: true })
          .take(limit)
          .skip(skip)
          .getMany(),
      ]);

      const lastPage = Math.ceil(total / limit);

      return {
        status: {
          statusMsg: 'ACCEPTED',
          statusCode: 200,
          error: null,
        },
        meta: {
          page,
          limit,
          lastPage,
          total,
        },
        data,
      };
    } catch (error) {
      ManagerError.createSignatureError(error.message);
    }
  }

  async findOne(id: string): Promise<OneApiResponse<UserEntity>> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: id, isActive: true },
      });
      if (!user) {
        throw new ManagerError({
          type: 'BAD_REQUEST',
          message: 'User not found',
        });
      }

      return {
        status: {
          statusMsg: 'ACCEPTED',
          statusCode: 200,
          error: null,
        },
        data: user,
      };
    } catch (error) {
      ManagerError.createSignatureError(error.message);
    }
  }

  async findOneByEmail(email: string): Promise<UserEntity | undefined> {
    try {
      const user = await this.userRepository.findOne({
        where: { email, isActive: true },
      });
      return user;
    } catch (error) {
      throw new ManagerError({
        type: 'INTERNAL_SERVER_ERROR',
        message: error.message,
      });
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UpdateResult> {
    try {
      const user = await this.userRepository.update({ id }, updateUserDto);
      if (user.affected === 0) {
        throw new ManagerError({
          type: 'NOT_FOUND',
          message: 'user not found!',
        });
      }
      return user;
    } catch (error) {
      ManagerError.createSignatureError(error.message);
    }
  }

  async remove(id: string): Promise<UpdateResult> {
    try {
      const user = await this.userRepository.update({ id }, { isActive: false });
      if (user.affected === 0) {
        throw new ManagerError({
          type: 'NOT_FOUND',
          message: 'user not found!',
        });
      }
      return user;
    } catch (error) {
      ManagerError.createSignatureError(error.message);
    }
  }
}
