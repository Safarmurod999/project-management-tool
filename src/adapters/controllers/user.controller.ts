import { Body, Controller, Inject, Post } from '@nestjs/common';
import { CreateUserUsecase } from 'src/application';
import { UsecaseSymbols } from 'src/infrastructure/dependency-injection/usecases/symbol';

export class CreateUserDto {
  name: string;
  email: string;
  password: string;
}

@Controller('users')
export class UserController {
  constructor(
    @Inject(UsecaseSymbols.CreateUserUsecase)
    private readonly createUserUsecase: CreateUserUsecase,
  ) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    const user = await this.createUserUsecase.execute({
      name: dto.name,
      email: dto.email,
      password: dto.password,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
