import { IApiResponse } from 'src/shared/IApiResponse';
import { CreateUserDto } from '../dto/create-user.dto';
import { IPagination } from 'src/shared/IPagination';
import { IPaginationResponse } from 'src/shared/IPaginationResponse';
import { User } from '../entities/user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';

export interface IUserService {
  create(createUser: CreateUserDto): Promise<IApiResponse<string>>;
  findAll(
    paginationFilter: IPagination,
  ): Promise<IApiResponse<IPaginationResponse<Array<User>>>>;
  //updateRole(updateUserRole: UpdateUserDto): Promise<IApiResponse<string>>;
}
