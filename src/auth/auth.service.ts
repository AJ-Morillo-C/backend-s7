import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { UsersService } from '../users/users.service';
import { ManagerError } from './../common/errors/manager.error';
import { OmitPassword } from 'src/common/types/users/omit-password.user';
import { UserEntity } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) { }

  async register(registerAuthDto: RegisterAuthDto): Promise<{ user: OmitPassword; token: string }> {
    const { name, email, password } = registerAuthDto
    try {
      // Check if user already exists
      const existingUser = await this.usersService.findOneByEmail(email)
      if (existingUser) {
        throw new ManagerError({
          type: "BAD_REQUEST",
          message: "User already exists!",
        })
      }

      // Create new user
      const user = await this.usersService.create({
        name,
        email,
        password,
      })

      const { password: _, ...rest } = user

      const token = this.jwtService.sign(rest, {
        secret: process.env.JWT_SECRET,
      })

      if (!token) {
        throw new ManagerError({
          type: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        })
      }

      return { user: rest, token }
    } catch (error) {
      ManagerError.createSignatureError(error.message)
    }
  }

  async login(loginAuthDto: LoginAuthDto): Promise<{ user: OmitPassword; token: string }> {
    const { email, password } = loginAuthDto
    try {
      const user = await this.usersService.findOneByEmail(email)
      if (!user) {
        throw new ManagerError({
          type: "BAD_REQUEST",
          message: "User not found!",
        })
      } else if (user.password !== password) {
        // In a real app, use bcrypt.compare here
        throw new ManagerError({
          type: "BAD_REQUEST",
          message: "Credentials not valid!",
        })
      }
      const { password: destructuring, ...rest } = user

      const token = this.jwtService.sign(rest, {
        secret: process.env.JWT_SECRET,
      })
      if (!token) {
        throw new ManagerError({
          type: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        })
      }
      return { user: rest, token }
    } catch (error) {
      ManagerError.createSignatureError(error.message)
    }
  }

  async validateToken(token: string): Promise<UserEntity> {
    try {
      const decoded = this.jwtService.verify(token, { secret: process.env.JWT_SECRET })
      const response = await this.usersService.findOne(decoded.id)
      const user = response.data

      if (!user) {
        throw new UnauthorizedException("Unauthorized")
      }

      return user
    } catch (error) {
      throw new UnauthorizedException("Unauthorized")
    }
  }
}