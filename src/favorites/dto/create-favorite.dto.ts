import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateFavoriteDto {
  @IsString()
  @IsNotEmpty()
  bookId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;
}
