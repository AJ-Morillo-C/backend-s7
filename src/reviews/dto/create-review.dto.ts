import { IsNotEmpty, IsString, IsInt, Min, Max, IsOptional } from "class-validator";

export class CreateReviewDto {

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  bookId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsOptional()
  comment?: string;
}

