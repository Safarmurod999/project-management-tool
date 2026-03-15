import { User } from './entity';
import { Database } from 'src/infrastructure/database/database';
import { Inject } from '@nestjs/common';
import { DatabaseSymbols } from 'src/infrastructure/dependency-injection/databases/symbol';
import { UserDocument } from 'src/infrastructure/database/mongodb/models';
import { Model, Types } from 'mongoose';
import { UserException } from './exception';
import { UserMapper } from 'src/infrastructure/database/mongodb/mappers/user.mapper';
import { UserStruct } from './factory';

export type UserCreateParams = Omit<
  UserStruct,
  'id' | 'createdAt' | 'updatedAt' | 'isVerified' | 'role'
> & { role: string };
export type UserUpdateParams = Omit<
  UserStruct,
  'role' | 'createdAt' | 'updatedAt'
> & { role: string; password?: string };

export interface UserGetQuery {
  page?: number;
  limit?: number;
  name?: string;
}

export interface UserGetResponse {
  data: User[];
  page: number;
  limit: number;
  totalCount: number;
}

export interface UserRepository {
  create(user: UserCreateParams): Promise<User>;
  find(params: UserGetQuery): Promise<UserGetResponse>;
  findById(id: string): Promise<User>;
  findByEmail(email: string): Promise<User>;
  update(user: Partial<UserUpdateParams>): Promise<User>;
  delete(id: string): Promise<string>;
}

export class UserRepositoryImpl implements UserRepository {
  constructor(
    @Inject(DatabaseSymbols.MongoDb)
    private database: Database,
  ) {}

  async create(user: UserCreateParams): Promise<User> {
    const userData = await (
      await this.userModel.create(user)
    ).populate('role');
    return UserMapper.toDomain(userData);
  }

  async find(params: UserGetQuery): Promise<UserGetResponse> {
    const { page = 1, limit = 10, name } = params;

    const filter: Record<string, any> = { role: { $ne: null } };

    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }

    const totalCount = await this.userModel.countDocuments(filter);

    const userDataList = await this.userModel
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('role')
      .exec();      

    return {
      data: userDataList.map((userData) => UserMapper.toDomain(userData)),
      totalCount: totalCount,
      page,
      limit,
    };
  }

  async findById(id: string): Promise<User> {
    const userData = await this.userModel
      .findById(id)
      .populate('role')
      .exec();

    if (!userData) throw UserException.UserNotFound(id);
    return UserMapper.toDomain(userData);
  }

  async findByEmail(email: string): Promise<User> {
    const userData = await this.userModel
      .findOne({ email: email })
      .populate('role')
      .exec();
    if (!userData) throw UserException.UserNotFound(email);
    return UserMapper.toDomain(userData);
  }

  async update(user: UserUpdateParams): Promise<User> {
    const userData = await this.userModel
      .findById(user.id)
      .populate('role');

    if (!userData) {
      throw UserException.UserNotFound(user.id);
    }
        
    userData.name = user.name ?? userData.name;
    userData.email = user.email ?? userData.email;
    userData.password = user.password ?? userData.password;
    userData.role = user.role
      ? new Types.ObjectId(user.role)
      : userData.role._id;
    userData.isVerified = user.isVerified ?? userData.isVerified;
    userData.updatedAt = new Date() as Date;
    userData.status = user.status ?? userData.status;

    await userData.save();

    await userData.populate('role');
    return UserMapper.toDomain(userData);
  }

  async delete(id: string): Promise<string> {
    await this.userModel.findByIdAndDelete(id).exec();
    return id;
  }

  private get userModel(): Model<UserDocument> {
    return this.database.userModel();
  }
}
