import {
  Body,
  Controller,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  SendOtpUsecase,
  VerifyOtpUsecase,
} from 'src/application';
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
    @Inject(UsecaseSymbols.SendOtpUsecase)
    private readonly sendOtpUsecase: SendOtpUsecase,
    @Inject(UsecaseSymbols.VerifyOtpUsecase)
    private readonly verifyOtpUsecase: VerifyOtpUsecase,
    @Inject(PresenterSymbols.OtpPresenter)
    private readonly otpPresenter: OtpPresenter,
  ) {}

  @Post()
  async create(@Body() dto: SendOtpDto) {
    const otp = await this.sendOtpUsecase.execute({
      email: dto.email,
    });

    return {
      status: HttpStatus.CREATED,
      data: this.otpPresenter.present(otp),
    };
  }

  @Patch(":token")
  async verify(@Body() dto: VerifyOtpDto, @Param("token") token: string) {
    const otp = await this.verifyOtpUsecase.execute({
      token,
      otpCode: dto.otpCode,
    });

    return {
      status: HttpStatus.OK,
      data: this.otpPresenter.present(otp),
    };
  }
}