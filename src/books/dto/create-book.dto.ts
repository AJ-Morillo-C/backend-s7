import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateBookDto {
    @IsString()
    @IsNotEmpty()
    title: string

    @IsNumber()
    @IsOptional()
    isbn?: number

    @IsString()
    @IsOptional()
    author?: string

    @IsString()
    @IsOptional()
    editorial?: string

    @IsNumber()
    @IsOptional()
    publicationDate?: number

    @IsString()
    @IsOptional()
    gender?: string

    @IsString()
    @IsOptional()
    synopsis?: string

    @IsString()
    @IsNotEmpty()
    file: string

    @IsNumber()
    @IsOptional()
    views?: number

    @IsNumber()
    @IsOptional()
    downloads?: number
}
