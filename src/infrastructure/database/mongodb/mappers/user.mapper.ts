import { User } from "src/domain";
import { RoleDocument, UserDocument } from "../models";
import { RoleMapper } from "./roles.mapper";

export class UserMapper {
  static toDomain(raw: UserDocument): User {
    let role;    
    if (typeof raw.role === 'object' && raw.role !== null) {
      role = RoleMapper.toDomain(raw.role as unknown as RoleDocument);
    } else {
      throw new Error('Role should be populated');
    }

    return new User(
      raw._id.toString(),
      raw.email,
      raw.password,
      raw.name,
      role,
      raw.isVerified,
      raw.createdAt,
      raw.updatedAt,
      raw.status
    );
  }

  static toPersistence(user: User): any {
    return {
      email: user.email,
      password: user.password,
      name: user.name,
      role: user.role.id,
      isVerified: user.isVerified,
      status: user.status,
    };
  }
}