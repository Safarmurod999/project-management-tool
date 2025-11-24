import {
  Body,
  Controller,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import {
  SendOtpUsecase,
} from 'src/application';
import { PresenterSymbols } from 'src/infrastructure/dependency-injection/presenters/symbol';
import { UsecaseSymbols } from 'src/infrastructure/dependency-injection/usecases/symbol';
import { OtpPresenter } from '../presenters';

export class SendOtpDto {
  email: string;
}

@Controller('otp')
export class OtpController {
  constructor(
    @Inject(UsecaseSymbols.SendOtpUsecase)
    private readonly sendOtpUsecase: SendOtpUsecase,
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
}
