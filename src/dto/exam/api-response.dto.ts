import { ApiProperty } from "@nestjs/swagger";

export class ApiResponse<T> {
  @ApiProperty({
    description: 'Indicates if the operation was successful',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Message describing the result of the operation',
    example: 'Exam created successfully'
  })
  message: string;

  @ApiProperty({
    description: 'The data returned by the operation',
    required: false
  })
  data?: T;

  @ApiProperty({
    description: 'Error message if the operation failed',
    required: false,
    example: 'Failed to create exam'
  })
  error?: string;

  constructor(success: boolean, message: string, data?: T, error?: string) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.error = error;
  }
}