import {
  Body,
  Controller,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { RegisterUserUsecase, VerifyUserUsecase } from 'src/application';
import { PresenterSymbols } from 'src/infrastructure';
import { UsecaseSymbols } from 'src/infrastructure/dependency-injection/usecases/symbol';
import { RegisterUserPresenter } from '../presenters';
import { RoleCode } from 'src/infrastructure/common/enum';

export class RegisterUserDto {
  email: string;
  name: string;
  password: string;
  role: RoleCode;
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
  async create(@Res() res: Response, @Body() dto: RegisterUserDto) {
    try {
      const result = await this.registerUserUsecase.execute({
        email: dto.email,
        name: dto.name,
        password: dto.password,
        role: dto.role,
      });

      res.status(HttpStatus.CREATED).send({
        success: true,
        status: HttpStatus.CREATED,
        data: this.registerUserPresenter.present(result),
      });
    } catch (error) {
      res.status(error.statusCode || HttpStatus.BAD_REQUEST).send({
        success: false,
        status: error.statusCode || HttpStatus.BAD_REQUEST,
        message: error.message || 'Failed to register user',
      });
    }
  }

  @Patch(':id')
  async verify(
    @Res() res: Response,
    @Body() dto: VerifyUserDto,
    @Param('id') id: string,
  ) {
    try {
      const result = await this.verifyUserUsecase.execute({
        id,
        token: dto.token,
      });

      res.status(HttpStatus.OK).send({
        success: true,
        status: HttpStatus.OK,
        data: result,
      });
    } catch (error) {
      res.status(error.statusCode || HttpStatus.BAD_REQUEST).send({
        success: false,
        status: error.statusCode || HttpStatus.BAD_REQUEST,
        message: error.message || 'Failed to verify user',
      });
    }
  }
}
