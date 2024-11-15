import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEmail, IsNotEmpty, IsOptional, Matches, MinLength } from 'class-validator';
import { PrimaryGeneratedColumn } from 'typeorm';

export class RegisterDto {

  @PrimaryGeneratedColumn()
  id: number;
  
  @ApiProperty({
    example: 'John',
    description: 'User first name',
  })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
  })
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address',
  })
  @IsNotEmpty()
  @IsEmail({}, {
    message: 'Please provide a valid email address'
  })
  @Matches(
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    {
      message: 'Invalid email format. Example: user@example.com'
    }
  )
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'User password (minimum 10 characters)',
  })
  @IsNotEmpty()
  @MinLength(10, {
    message: 'Password must be at least 10 characters long'
  })
  password: string;

  @ApiProperty({
    example: '+11234567890',
    description: 'US mobile number with country code',
  })
  @IsNotEmpty()
  @Matches(/^\+1[0-9]{10}$/, {
    message: 'Mobile number must be in format: +1XXXXXXXXXX (10 digits after country code)'
  })
  mobile: string;

  @ApiProperty({
    example: 'Computer Science',
    description: 'User major/field of study',
  })
  @IsNotEmpty()
  major: string;

  @ApiProperty({
    example: new Date(),
    description: 'User creation timestamp',
  })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  createdOn: Date = new Date();

  @ApiProperty({
    example: null,
    description: 'User last update timestamp',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  updatedOn?: Date;

}