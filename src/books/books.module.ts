import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookEntity } from './entities/book.entity';

@Module({
  controllers: [BooksController],
  providers: [BooksService],
  imports: [TypeOrmModule.forFeature([BookEntity])],
  exports: [BooksService]
})
export class BooksModule { }
