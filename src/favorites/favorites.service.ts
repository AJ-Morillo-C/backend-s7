import { Injectable } from '@nestjs/common';
import { DeepPartial, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FavoriteEntity } from './entities/favorite.entity';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { PaginationDto } from 'src/common/dtos/pagination/pagination.dto';
import { AllApiResponse, OneApiResponse } from 'src/common/interfaces/response-api.interface';
import { ManagerError } from 'src/common/errors/manager.error';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(FavoriteEntity)
    private readonly favoritesRepository: Repository<FavoriteEntity>,
  ) { }

  async create(createFavoriteDto: CreateFavoriteDto): Promise<FavoriteEntity> {
    try {
      // Crea una nueva instancia de FavoriteEntity
      const favorite = this.favoritesRepository.create({
        book: { id: createFavoriteDto.bookId }, // Asigna la relación con el libro
        user: { id: createFavoriteDto.userId }, // Asigna la relación con el usuario
      });

      // Guarda la entidad en la base de datos
      const savedFavorite = await this.favoritesRepository.save(favorite);

      if (!savedFavorite) {
        throw new ManagerError({
          type: 'CONFLICT',
          message: 'favorite not created!',
        });
      }

      return savedFavorite;
    } catch (error) {
      ManagerError.createSignatureError(error.message);
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<AllApiResponse<FavoriteEntity>> {
    const { limit, page } = paginationDto;
    const skip = (page - 1) * limit;
    try {
      const [total, data] = await Promise.all([
        this.favoritesRepository.count({ where: { isActive: true } }),
        this.favoritesRepository.find({
          where: { isActive: true },
          relations: ['book', 'user'], // Carga las relaciones
          take: limit,
          skip: skip,
        }),
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

  async findOne(id: string): Promise<OneApiResponse<FavoriteEntity>> {
    try {
      const favorite = await this.favoritesRepository.findOne({
        where: { id, isActive: true },
        relations: ['book', 'user'], // Carga las relaciones
      });

      if (!favorite) {
        throw new ManagerError({
          type: 'NOT_FOUND',
          message: 'favorite not found!',
        });
      }

      return {
        status: {
          statusMsg: 'ACCEPTED',
          statusCode: 200,
          error: null,
        },
        data: favorite,
      };
    } catch (error) {
      ManagerError.createSignatureError(error.message);
    }
  }

  async update(id: string, updateFavoriteDto: UpdateFavoriteDto): Promise<FavoriteEntity> {
    try {
      await this.favoritesRepository.update(id, updateFavoriteDto as DeepPartial<FavoriteEntity>);
      const updatedFavorite = await this.favoritesRepository.findOne({ where: { id } });
      if (!updatedFavorite) {
        throw new ManagerError({
          type: 'NOT_FOUND',
          message: 'favorite not found!',
        });
      }
      return updatedFavorite;
    } catch (error) {
      ManagerError.createSignatureError(error.message);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.favoritesRepository.update(id, { isActive: false });
      if (result.affected === 0) {
        throw new ManagerError({
          type: 'NOT_FOUND',
          message: 'favorite not found!',
        });
      }
    } catch (error) {
      ManagerError.createSignatureError(error.message);
    }
  }
}
