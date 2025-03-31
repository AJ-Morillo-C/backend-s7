import { Module } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { AuthorsController } from './authors.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorEntity } from './entities/author.entity';

@Module({
  controllers: [AuthorsController],
  providers: [AuthorsService],
  imports: [
    TypeOrmModule.forFeature([AuthorEntity])
  ],
  exports: []
})
export class AuthorsModule {}
