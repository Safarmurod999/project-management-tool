import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  CreateUserUsecase,
  DeleteUserUsecase,
  FindUserByEmailUsecase,
  FindUserByIdUsecase,
  UpdateUserUsecase,
} from 'src/application';
import { PresenterSymbols } from 'src/infrastructure/dependency-injection/presenters/symbol';
import { UsecaseSymbols } from 'src/infrastructure/dependency-injection/usecases/symbol';
import {
  CreateUserPresenter,
  FindUserByEmailPresenter,
  FindUserByIdPresenter,
  UpdateUserPresenter,
} from '../presenters';

export class CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: string;
}

@Controller('users')
export class UserController {
  constructor(
    @Inject(UsecaseSymbols.User.CreateUserUsecase)
    private readonly createUserUsecase: CreateUserUsecase,
    @Inject(PresenterSymbols.User.CreateUserPresenter)
    private readonly createUserPresenter: CreateUserPresenter,

    @Inject(UsecaseSymbols.User.FindUserByIdUsecase)
    private readonly findUserByIdUsecase: FindUserByIdUsecase,
    @Inject(PresenterSymbols.User.FindUserByIdPresenter)
    private readonly findUserByIdPresenter: FindUserByIdPresenter,

    @Inject(UsecaseSymbols.User.FindUserByEmailUsecase)
    private readonly findUserByEmailUsecase: FindUserByEmailUsecase,
    @Inject(PresenterSymbols.User.FindUserByEmailPresenter)
    private readonly findUserByEmailPresenter: FindUserByEmailPresenter,

    @Inject(UsecaseSymbols.User.UpdateUserUsecase)
    private readonly updateUserUsecase: UpdateUserUsecase,
    @Inject(PresenterSymbols.User.UpdateUserPresenter)
    private readonly updateUserPresenter: UpdateUserPresenter,

    @Inject(UsecaseSymbols.User.DeleteUserUsecase)
    private readonly deleteUserUsecase: DeleteUserUsecase,
  ) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    const user = await this.createUserUsecase.execute({
      name: dto.name,
      email: dto.email,
      password: dto.password,
      role: dto.role,
    });

    return {
      status: HttpStatus.CREATED,
      data: this.createUserPresenter.present(user),
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const user = await this.findUserByIdUsecase.execute({ id });
    return {
      status: HttpStatus.OK,
      data: this.findUserByIdPresenter.present(user),
    };
  }

  @Get('email/:email')
  async findByEmail(@Param('email') email: string) {
    const user = await this.findUserByEmailUsecase.execute({ email });
    return {
      status: HttpStatus.OK,
      data: this.findUserByEmailPresenter.present(user),
    };
  }

  @Put(':id')
  async update(@Body() dto: CreateUserDto & { isVerified: boolean }, @Param('id') id: string) {
    const user = await this.updateUserUsecase.execute({
      id,
      name: dto.name,
      email: dto.email,
      password: dto.password,
      role: dto.role,
      isVerified: dto.isVerified
    });
    return {
      status: HttpStatus.OK,
      data: this.updateUserPresenter.present(user),
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const deletedUserId = await this.deleteUserUsecase.execute({ id });
    return {
      status: HttpStatus.OK,
      data: deletedUserId,
    };
  }
}
