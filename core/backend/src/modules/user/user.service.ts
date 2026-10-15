import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IUserService } from './interfaces/user.service.interface';
import { IApiResponse } from 'src/shared/IApiResponse';
import { IPagination } from 'src/shared/IPagination';
import { IPaginationResponse } from 'src/shared/IPaginationResponse';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SanitizeXSS } from 'src/utils/SanitizeXSS.util';
import { hashPassword } from 'src/utils/Password.util';
import { randomUUID } from 'crypto';

@Injectable()
export class UserService implements IUserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}
  async create(createUser: CreateUserDto): Promise<IApiResponse<string>> {
    try {
      const user: User = new User();
      user.user_code = randomUUID();
      user.user_name = SanitizeXSS(createUser.user_name);
      user.user_email = SanitizeXSS(createUser.user_email);
      user.user_password = await hashPassword(createUser.user_password);
      user.user_role = createUser.user_role!;
      const userIsRegisted = await this.userRepository.findOneBy({
        user_email: user.user_email,
      });
      if (userIsRegisted)
        return {
          status: HttpStatus.CONFLICT,
          success: false,
          data: 'User already exists!',
        };
      const result = await this.userRepository.save(user);
      return {
        data: result.user_code,
        status: HttpStatus.CREATED,
        success: true,
        message: 'User create successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async findAll(
    paginationFilter: IPagination,
  ): Promise<IApiResponse<IPaginationResponse<Array<User>>>> {
    try {
      const paginationSafe: IPagination = {
        limit: 100,
        offset: 0,
        orderby: 'ASC',
        sortby: 'user_name',
        ...paginationFilter,
      };
      const result = await this.userRepository
        .createQueryBuilder()
        .take(paginationSafe.limit)
        .skip(paginationSafe.offset)
        .addOrderBy(paginationSafe.sortby!, paginationSafe.orderby)
        .getMany();

      return {
        data: {
          data: result,
          limit: paginationSafe.limit!,
          offset: paginationSafe.offset!,
          orderby: paginationSafe.orderby!,
          sortby: paginationSafe.sortby!,
          total: result.length,
        },
        status: HttpStatus.OK,
        success: true,
        message: 'All user Listed',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
 /* async updateRole(updateUserRole: UpdateUserDto): Promise<IApiResponse<string>> {
    try {

    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }*/
}
