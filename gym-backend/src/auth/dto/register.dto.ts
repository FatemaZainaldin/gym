// dto/register.dto.ts
import {
    IsEmail,
    IsString,
    MinLength,
    MaxLength,
    IsOptional,
    IsPhoneNumber,
    Matches,
    isString,
} from 'class-validator';
import { UserRole } from 'src/users/entities/user.entity';

export class RegisterDto {
    @IsString()
    @MinLength(2, { message: 'First name must be at least 2 characters long' })
    @MaxLength(100, { message: 'First name cannot exceed 100 characters' })
    firstName: string;

    @IsString()
    @MinLength(2, { message: 'Last name must be at least 2 characters long' })
    @MaxLength(100, { message: 'Last name cannot exceed 100 characters' })
    lastName: string;

    @IsEmail({}, { message: 'Please provide a valid email address' })
    @MaxLength(255, { message: 'Email cannot exceed 255 characters' })
    email: string;

    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    @MaxLength(50, { message: 'Password cannot exceed 50 characters' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    })
    password: string;

    @IsOptional()
    @IsPhoneNumber(undefined, { message: 'Please provide a valid phone number' })
    @MaxLength(20, { message: 'Phone number cannot exceed 20 characters' })
    phone?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500, { message: 'Avatar URL cannot exceed 500 characters' })
    avatar?: string;

    @IsString()
    role: UserRole;
}