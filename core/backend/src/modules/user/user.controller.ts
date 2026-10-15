import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { type IPagination } from 'src/shared/IPagination';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll(@Query() paginationOption: IPagination) {
    return this.userService.findAll(paginationOption);
  }
  @Patch('')
  update(@Body() updateUserDto: UpdateUserDto) {
    //return this.userService.update(updateUserDto);
  }
}
