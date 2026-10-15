import { UserRole } from '../enums/user-role.enum';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateUserDto {
  @IsUUID()
  @IsNotEmpty()
  user_code!: string;
  @IsEnum(UserRole)
  @IsNotEmpty()
  user_role!: UserRole;
}
