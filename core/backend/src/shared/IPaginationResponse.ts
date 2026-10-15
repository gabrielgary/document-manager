import { IPagination } from './IPagination';

export interface IPaginationResponse<DataType> extends Required<IPagination> {
  data: DataType;
  total: number;
}
