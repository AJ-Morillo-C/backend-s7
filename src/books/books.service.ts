import { Injectable } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Repository, UpdateResult } from 'typeorm';
import { BookEntity } from './entities/book.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ManagerError } from 'src/common/errors/manager.error';
import { PaginationDto } from 'src/common/dtos/pagination/pagination.dto';
import { AllApiResponse, OneApiResponse } from 'src/common/interfaces/response-api.interface';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(BookEntity)
    private readonly bookRepository: Repository<BookEntity>,
  ) { }

  async create(createBookDto: CreateBookDto): Promise<BookEntity> {
    try {
      const { author, editorial, gender, ...bookData } = createBookDto;
      const book = this.bookRepository.create({
        ...bookData,
        author: author ? { id: author } : undefined,
        editorial: editorial ? { id: editorial } : undefined,
        gender: gender ? { id: gender } : undefined,
      });

      const savedBook = await this.bookRepository.save(book);
      if (!savedBook) {
        throw new ManagerError({
          type: 'CONFLICT',
          message: 'Book not created!',
        });
      }
      return savedBook;
    } catch (error) {
      ManagerError.createSignatureError(error.message);
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<AllApiResponse<any>> {
    const { limit, page } = paginationDto;
    const skip = (page - 1) * limit;
    try {
      const [total, data] = await Promise.all([
        this.bookRepository.count({ where: { isActive: true } }),
        this.bookRepository
          .createQueryBuilder('book')
          .leftJoinAndSelect('book.author', 'author')
          .leftJoinAndSelect('book.editorial', 'editorial')
          .leftJoinAndSelect('book.gender', 'gender')
          .where('book.isActive = :isActive', { isActive: true })
          .take(limit)
          .skip(skip)
          .getMany(),
      ]);

      const lastPage = Math.ceil(total / limit);

      if (!data) {
        throw new ManagerError({
          type: 'NOT_FOUND',
          message: 'books not found!'
        });
      }

      const mappedData = data.map((book) => ({
        id: book.id,
        title: book.title,
        isbn: book.isbn,
        author: book.author ? book.author.authorName : null,
        editorial: book.editorial ? book.editorial.editorialName : null,
        gender: book.gender ? book.gender.genderName : null,
        publicationDate: book.publicationDate,
        synopsis: book.synopsis,
        file: book.file,
        views: book.views,
        downloads: book.downloads,
        averageRating: book.averageRating,
        isActive: book.isActive,
        createdAt: book.createdAt,
        updatedAt: book.updatedAt,
      }));

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
        data: mappedData
      };
    } catch (error) {
      ManagerError.createSignatureError(error.message);
    }
  }

  async findOne(id: string): Promise<OneApiResponse<any>> {
    try {
      const book = await this.bookRepository
        .createQueryBuilder('book')
        .where({ id, isActive: true })
        .leftJoinAndSelect('book.author', 'author')
        .leftJoinAndSelect('book.editorial', 'editorial')
        .leftJoinAndSelect('book.gender', 'gender')
        .getOne();

      if (!book) {
        throw new ManagerError({
          type: 'NOT_FOUND',
          message: 'Book not found!'
        });
      }

      // Increment views counter
      await this.bookRepository.update(id, { views: () => "views + 1" })

      const mappedBook = {
        id: book.id,
        title: book.title,
        isbn: book.isbn,
        author: book.author ? book.author.authorName : null,
        editorial: book.editorial ? book.editorial.editorialName : null,
        gender: book.gender ? book.gender.genderName : null,
        publicationDate: book.publicationDate,
        synopsis: book.synopsis,
        file: book.file,
        views: book.views,
        downloads: book.downloads,
        averageRating: book.averageRating,
        isActive: book.isActive,
        createdAt: book.createdAt,
        updatedAt: book.updatedAt,
      };

      return {
        status: {
          statusMsg: 'ACCEPTED',
          statusCode: 200,
          error: null
        },
        data: mappedBook
      };
    } catch (error) {
      ManagerError.createSignatureError(error.message);
    }
  }

  async update(id: string, updateBookDto: UpdateBookDto): Promise<UpdateResult> {
    try {
      const { author, editorial, gender, ...bookData } = updateBookDto;
      const updateData = {
        ...bookData,
        author: author ? { id: author } : undefined,
        editorial: editorial ? { id: editorial } : undefined,
        gender: gender ? { id: gender } : undefined,
      };

      const book = await this.bookRepository.update({ id }, updateData);
      if (book.affected === 0) {
        throw new ManagerError({
          type: 'NOT_FOUND',
          message: 'Book not found!',
        });
      }
      return book;
    } catch (error) {
      ManagerError.createSignatureError(error.message);
    }
  }

  async remove(id: string): Promise<{ status: any; data: UpdateResult }> {
    try {
      const book = await this.bookRepository.update({ id }, { isActive: false });
      if (book.affected === 0) {
        throw new ManagerError({
          type: 'NOT_FOUND',
          message: 'book not found!'
        });
      }
      return {
        status: {
          statusMsg: 'ACCEPTED',
          statusCode: 200,
          error: null
        },
        data: book
      };
    } catch (error) {
      ManagerError.createSignatureError(error.message);
    }
  }

  async incrementDownloads(id: string): Promise<OneApiResponse<BookEntity>> {
    try {
      const result = await this.bookRepository.update(id, { downloads: () => "downloads + 1" })

      if (result.affected === 0) {
        throw new ManagerError({
          type: "NOT_FOUND",
          message: "Book not found!",
        })
      }

      const updatedBook = await this.bookRepository.findOne({ where: { id } })

      return {
        status: {
          statusMsg: "ACCEPTED",
          statusCode: 200,
          error: null,
        },
        data: updatedBook,
      }
    } catch (error) {
      ManagerError.createSignatureError(error.message)
    }
  }

  async updateAverageRating(bookId: string): Promise<void> {
    try {
      // Get all active reviews for the book
      const book = await this.bookRepository
        .createQueryBuilder("book")
        .where({ id: bookId, isActive: true })
        .leftJoinAndSelect("book.reviews", "review", "review.isActive = :isActive", { isActive: true })
        .getOne()

      if (!book || !book.reviews || book.reviews.length === 0) {
        return
      }

      // Calculate average rating
      const totalRating = book.reviews.reduce((sum, review) => sum + review.rating, 0)
      const averageRating = totalRating / book.reviews.length

      // Update the book with the new average rating
      await this.bookRepository.update(bookId, { averageRating })
    } catch (error) {
      ManagerError.createSignatureError(error.message)
    }
  }
}
