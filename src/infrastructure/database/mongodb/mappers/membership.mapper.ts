import { Membership, MembershipDetails } from 'src/domain';
import { MembershipDocument } from '../models';

export class MembershipMapper {
  static toDomain(raw: MembershipDocument): Membership {
    return new Membership(
      raw._id.toString(),
      raw.userId.toString(),
      raw.scopeType,
      raw.scopeId.toString(),
      raw.roleId.toString(),
      raw.override,
      raw.createdAt,
      raw.updatedAt,
    );
  }

  static toDetailsDomain(raw: any): MembershipDetails {
    return new MembershipDetails(
      raw._id.toString(),
      raw.userId,
      raw.roleId,
      raw.scopeType,
      raw.scopeId.toString(),
      raw.override,
      raw.createdAt,
      raw.updatedAt,
    );
  }
}
