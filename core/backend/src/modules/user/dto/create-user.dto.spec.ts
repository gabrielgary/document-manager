import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UserRole } from '../enums/user-role.enum';
import { CreateUserDto } from './create-user.dto';

describe('User DTOs', () => {
  it('normalizes user input before validating it', async () => {
    const dto = plainToInstance(CreateUserDto, {
      name: '  Jane Doe  ',
      email: '  JANE@EXAMPLE.COM  ',
      password: 'secure password',
      role: ' ADMIN ',
    });

    expect(await validate(dto)).toHaveLength(0);
    expect(dto.name).toBe('Jane Doe');
    expect(dto.email).toBe('jane@example.com');
    expect(dto.role).toBe(UserRole.ADMIN);
  });

  it('rejects invalid fields and passwords containing only whitespace', async () => {
    const dto = plainToInstance(CreateUserDto, {
      name: '   ',
      email: 'not-an-email',
      password: '   ',
      role: 'owner',
    });

    const invalidProperties = (await validate(dto)).map(
      ({ property }) => property,
    );
    expect(invalidProperties).toEqual(
      expect.arrayContaining(['name', 'email', 'password', 'role']),
    );
  });
});
