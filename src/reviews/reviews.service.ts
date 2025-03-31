import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Repository, UpdateResult } from 'typeorm';
import { ReviewEntity } from './entities/review.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ManagerError } from 'src/common/errors/manager.error';
import { PaginationDto } from 'src/common/dtos/pagination/pagination.dto';
import { AllApiResponse, OneApiResponse } from 'src/common/interfaces/response-api.interface';

@Injectable()
export class ReviewsService {

  constructor(
    @InjectRepository(ReviewEntity)
    private readonly reviewsRepository: Repository<ReviewEntity>,
  ) { }

  async create(createReviewDto: CreateReviewDto): Promise<ReviewEntity> {
    try {
      const review = await this.reviewsRepository.save(createReviewDto);
      if (!review) {
        throw new ManagerError({
          type: 'CONFLICT',
          message: 'review not created!'
        })
      }
      return review;
    } catch (error) {
      ManagerError.createSignatureError(error.message);
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<AllApiResponse<ReviewEntity>> {
    const { limit, page } = paginationDto;
    const skip = (page - 1) * limit;
    try {
      const [total, data] = await Promise.all([
        this.reviewsRepository.count({ where: { isActive: true } }),
        this.reviewsRepository
          .createQueryBuilder('review')
          .where({ isActive: true })
          .leftJoinAndSelect('review.user', 'user')
          .leftJoinAndSelect('review.book', 'book')
          .take(limit)
          .skip(skip)
          .getMany(),
      ])

      const lastPage = Math.ceil(total / limit);
      return {
        status: {
          statusMsg: 'ACCEPTED',
          statusCode: 200,
          error: null
        },
        meta: {
          page,
          limit,
          lastPage,
          total,
        },
        data
      }
    } catch (error) {
      ManagerError.createSignatureError(error.message);
    }
  }


  async findOne(id: string): Promise<OneApiResponse<ReviewEntity>> {
    try {
      const review = await this.reviewsRepository
        .createQueryBuilder('review')
        .where({ id, isActive: true })
        .getOne();


      if (!review) {
        throw new ManagerError({
          type: 'NOT_FOUND',
          message: 'review not found!'
        })
      }

      return {
        status: {
          statusMsg: 'ACCEPTED',
          statusCode: 200,
          error: null
        },
        data: review
      }
    } catch (error) {
      ManagerError.createSignatureError(error.message);
    }
  }

  async update(id: string, updateReviewDto: UpdateReviewDto): Promise<UpdateResult> {
    try {
      const review = await this.reviewsRepository.update({ id }, updateReviewDto)
      if (review.affected === 0) {
        throw new ManagerError({
          type: 'CONFLICT',
          message: 'review not found!'
        })
      }
      return review;
    } catch (error) {
      ManagerError.createSignatureError(error.message);
    }
  }

  async remove(id: string): Promise<UpdateResult> {
    try {
      const review = await this.reviewsRepository.update({ id }, { isActive: false });
      if (review.affected === 0) {
        throw new ManagerError({
          type: 'NOT_FOUND',
          message: 'review not found!'
        })
      }
      return review;
    } catch (error) {
      ManagerError.createSignatureError(error.message);
    }
  }


}
