import { Membership } from 'src/domain';
import { MembershipDocument } from '../models';

export class MembershipMapper {
  static toDomain(raw: MembershipDocument): Membership {
    return new Membership(
      raw._id.toString(),
      raw.userId.toString(),
      raw.scopeType,
      raw.scopeId.toString(),
      raw.roleId.toString(),
      raw.createdAt,
      raw.updatedAt,
    );
  }
}
