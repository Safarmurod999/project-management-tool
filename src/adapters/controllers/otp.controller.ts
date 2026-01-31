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
import { SendOtpUsecase, VerifyOtpUsecase } from 'src/application';
import { PresenterSymbols } from 'src/infrastructure/dependency-injection/presenters/symbol';
import { UsecaseSymbols } from 'src/infrastructure/dependency-injection/usecases/symbol';
import { OtpPresenter } from '../presenters';

export class SendOtpDto {
  email: string;
}

export class VerifyOtpDto {
  otpCode: string;
}

@Controller('otp')
export class OtpController {
  constructor(
    @Inject(UsecaseSymbols.Otp.SendOtpUsecase)
    private readonly sendOtpUsecase: SendOtpUsecase,
    @Inject(UsecaseSymbols.Otp.VerifyOtpUsecase)
    private readonly verifyOtpUsecase: VerifyOtpUsecase,
    @Inject(PresenterSymbols.Otp.OtpPresenter)
    private readonly otpPresenter: OtpPresenter,
  ) {}

  @Post()
  async create(@Res() res: Response, @Body() dto: SendOtpDto) {
    try {
      const otp = await this.sendOtpUsecase.execute({ email: dto.email });

      res.status(HttpStatus.CREATED).send({
        success: true,
        status: HttpStatus.CREATED,
        data: this.otpPresenter.present(otp),
      });
    } catch (error) {
      res.status(error.statusCode || HttpStatus.BAD_REQUEST).send({
        success: false,
        status: error.statusCode || HttpStatus.BAD_REQUEST,
        message: error.message || 'Failed to send OTP',
      });
    }
  }

  @Patch(':token')
  async verify(
    @Res() res: Response,
    @Body() dto: VerifyOtpDto,
    @Param('token') token: string,
  ) {
    try {
      const otp = await this.verifyOtpUsecase.execute({
        token,
        otpCode: dto.otpCode,
      });

      res.status(HttpStatus.OK).send({
        success: true,
        status: HttpStatus.OK,
        data: this.otpPresenter.present(otp),
      });
    } catch (error) {
      res.status(error.statusCode || HttpStatus.BAD_REQUEST).send({
        success: false,
        status: error.statusCode || HttpStatus.BAD_REQUEST,
        message: error.message || 'Failed to verify OTP',
      });
    }
  }
}
