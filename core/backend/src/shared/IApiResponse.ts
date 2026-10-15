import { HttpStatus } from '@nestjs/common';

export interface IApiResponse<T> {
  data: T;
  status: HttpStatus;
  message?: string;
  success: boolean;
  error?: any;
}
