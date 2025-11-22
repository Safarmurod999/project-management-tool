import { User } from './entity';
import { Database } from 'src/infrastructure/database/database';
import { Inject } from '@nestjs/common';
import { DatabaseSymbols } from 'src/infrastructure/dependency-injection/databases/symbol';
import { UserDocument } from 'src/infrastructure/database/mongodb/models';
import { Model } from 'mongoose';
import { FactorySymbols } from 'src/infrastructure/dependency-injection';
import { UserFactory, UserStruct } from './factory';
import { UserException } from './exception';

export type UserCreateParams = Omit<UserStruct, 'id' | 'createdAt' | 'updatedAt'>;
export type UserUpdateParams = Omit<UserStruct, 'createdAt' | 'updatedAt'>;

export interface UserRepository {
  create(user: UserCreateParams): Promise<User>;
  findById(id: string): Promise<User>;
  findByEmail(email: string): Promise<User>;
  update(user: UserUpdateParams): Promise<User>;
  delete(id: string): Promise<string>;
}

export class UserRepositoryImpl implements UserRepository {
  constructor(
    @Inject(FactorySymbols.UserFactory)
    private userFactory: UserFactory,

    @Inject(DatabaseSymbols.MongoDb)
    private database: Database,
  ) {}

  async create(user: UserCreateParams): Promise<User> {
    const userData = await this.userModel.create(user);
    return this.toEntity(userData);
  }

  async findById(id: string): Promise<User> {
    const userData = await this.userModel.findById(id).exec();
    if (!userData) throw UserException.UserNotFound(id);
    return this.toEntity(userData);
  }

  async findByEmail(email: string): Promise<User> {
    const userData = await this.userModel.findOne({ email: email }).exec();
    if (!userData) throw UserException.UserNotFound(email);
    return this.toEntity(userData);
  }

  async update(user: UserUpdateParams): Promise<User> {
    const userData = await this.userModel.findById(user.id);

    if (!userData) {
      throw UserException.UserNotFound(user.id);
    }

    userData.name = user.name ?? userData.name;
    userData.email = user.email ?? userData.email;
    userData.password = user.password ?? userData.password;
    userData.updatedAt = new Date();

    await userData.save();
    return this.toEntity(userData);
  }

  async delete(id: string): Promise<string> {
    await this.userModel.findByIdAndDelete(id).exec();
    return id;
  }

  private get userModel(): Model<UserDocument> {
    return this.database.userModel();
  }

  private toEntity(model: any) {
    return this.userFactory.create({
      id: model.id,
      name: model.name,
      email: model.email,
      password: model.password,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }
}
