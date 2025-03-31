import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewEntity } from './entities/review.entity';

@Module({
  controllers: [ReviewsController],
  providers: [ReviewsService],
  imports: [
    TypeOrmModule.forFeature([ReviewEntity])
  ],
  exports: []
})
export class ReviewsModule {}
