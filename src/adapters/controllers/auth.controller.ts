import {
  Body,
  Controller,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { RegisterUserUsecase, VerifyUserUsecase } from 'src/application';
import { PresenterSymbols } from 'src/infrastructure';
import { UsecaseSymbols } from 'src/infrastructure/dependency-injection/usecases/symbol';
import { RegisterUserPresenter } from '../presenters';

export class RegisterUserDto {
  email: string;
  name: string;
  password: string;
  role: string;
}

export class VerifyUserDto {
  token: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(UsecaseSymbols.Auth.RegisterUserUsecase)
    private readonly registerUserUsecase: RegisterUserUsecase,
    @Inject(UsecaseSymbols.Auth.VerifyUserUsecase)
    private readonly verifyUserUsecase: VerifyUserUsecase,
    @Inject(PresenterSymbols.Auth.RegisterUserPresenter)
    private readonly registerUserPresenter: RegisterUserPresenter,
  ) {}

  @Post('register')
  async create(@Body() dto: RegisterUserDto) {
    const result = await this.registerUserUsecase.execute({
      email: dto.email,
      name: dto.name,
      password: dto.password,
      role: dto.role,
    });

    return {
      status: HttpStatus.CREATED,
      data: this.registerUserPresenter.present(result),
    };
  }

  @Patch(':id')
  async verify(@Body() dto: VerifyUserDto, @Param('id') id: string) {
    const result = await this.verifyUserUsecase.execute({
      id,
      token: dto.token,
    });

    return {
      status: HttpStatus.OK,
      data: result,
    };
  }
}
