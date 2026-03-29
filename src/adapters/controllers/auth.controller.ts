import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  LoginUserUsecase,
  RefreshTokenUsecase,
  RegisterUserUsecase,
  VerifyUserUsecase,
  GetMeUsecase,
} from 'src/application';
import { PresenterSymbols } from 'src/infrastructure';
import { UsecaseSymbols } from 'src/infrastructure/dependency-injection/usecases/symbol';
import { RegisterUserPresenter } from 'src/adapters/presenters';
import { RoleCode } from 'src/infrastructure/common/enum';
import { RolesPermissionsGuard } from 'src/infrastructure/middlewares/role-guard.middleware';

export class RegisterUserDto {
  email: string;
  name: string;
  password: string;
}

export class LoginUserDto {
  email: string;
  password: string;
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
    @Inject(UsecaseSymbols.Auth.LoginUserUsecase)
    private readonly loginUserUsecase: LoginUserUsecase,
    @Inject(UsecaseSymbols.Auth.RefreshTokenUsecase)
    private readonly refreshTokenUsecase: RefreshTokenUsecase,
    @Inject(UsecaseSymbols.Auth.GetMeUsecase)
    private readonly getMeUsecase: GetMeUsecase,
  ) {}

  @Post('register')
  async create(@Res() res: Response, @Body() dto: RegisterUserDto) {
    try {
      const result = await this.registerUserUsecase.execute({
        email: dto.email,
        name: dto.name,
        password: dto.password,
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
      res.cookie('refresh_token', result.refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(HttpStatus.CREATED).send({
        success: true,
        status: HttpStatus.CREATED,
        data: result.access_token,
      });
    } catch (error) {
      res.status(error.statusCode || HttpStatus.BAD_REQUEST).send({
        success: false,
        status: error.statusCode || HttpStatus.BAD_REQUEST,
        message: error.message || 'Failed to verify user',
      });
    }
  }

  @Post('login')
  async login(@Res() res: Response, @Body() dto: LoginUserDto) {
    try {
      const result = await this.loginUserUsecase.execute({
        email: dto.email,
        password: dto.password,
      });

      res.cookie('refresh_token', result.refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(HttpStatus.CREATED).send({
        success: true,
        status: HttpStatus.CREATED,
        data: result.access_token,
      });
    } catch (error) {
      res.status(error.statusCode || HttpStatus.BAD_REQUEST).send({
        success: false,
        status: error.statusCode || HttpStatus.BAD_REQUEST,
        message: error.message || 'Failed to login user',
      });
    }
  }

  @Post('refresh-token')
  async refreshToken(@Req() req: Request, @Res() res: Response) {    
    try {
      const refreshToken = req.cookies['refresh_token'];    

    const result = await this.refreshTokenUsecase.execute(refreshToken);

    res.status(HttpStatus.OK).send({
      success: true,
      status: HttpStatus.OK,
      data: result
    });
    } catch (error) {
      res.status(error.statusCode || HttpStatus.BAD_REQUEST).send({
        success: false,
        status: error.statusCode || HttpStatus.BAD_REQUEST,
        message: error.message || 'Failed to refresh token',
      });
    }
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    try {

      res.cookie('refresh_token', '', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 0,
      });

      res.status(HttpStatus.OK).send({
        success: true,
        status: HttpStatus.OK,
        message: 'Logged out successfully',
      });
    } catch (error) {
      res.status(error.statusCode || HttpStatus.BAD_REQUEST).send({
        success: false,
        status: error.statusCode || HttpStatus.BAD_REQUEST,
        message: error.message || 'Failed to logout',
      });
    }
  }

  @Get('me')
  @UseGuards(RolesPermissionsGuard)
  async getMe(@Req() req: Request, @Res() res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(HttpStatus.UNAUTHORIZED).send({
          success: false,
          status: HttpStatus.UNAUTHORIZED,
          message: 'User not authenticated',
        });
      }

      const result = await this.getMeUsecase.execute({ userId });

      res.status(HttpStatus.OK).send({
        success: true,
        status: HttpStatus.OK,
        data: result,
      });
    } catch (error) {
      res.status(error.statusCode || HttpStatus.BAD_REQUEST).send({
        success: false,
        status: error.statusCode || HttpStatus.BAD_REQUEST,
        message: error.message || 'Failed to get user data',
      });
    }
  }
}
