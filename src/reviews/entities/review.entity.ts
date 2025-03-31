import { BaseEntity } from './../../common/config/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BookEntity } from './../../books/entities/book.entity';
import { UserEntity } from './../../users/entities/user.entity';

@Entity({ name: 'review' })
export class ReviewEntity extends BaseEntity {

  @ManyToOne(
    () => UserEntity,
    (user) => user.reviews
  )
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ManyToOne(
    () => BookEntity,
    (book) => book.reviews
  )
  @JoinColumn({ name: 'bookId' })
  book: BookEntity;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

}