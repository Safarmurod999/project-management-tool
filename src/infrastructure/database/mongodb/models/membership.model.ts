import { Document, Types } from 'mongoose';
import { ScopeType } from 'src/infrastructure/common/enum';

export interface MembershipDocument extends Document {
  userId: Types.ObjectId;
  scopeType: ScopeType;
  scopeId: Types.ObjectId;
  roleId: Types.ObjectId;
  override: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}
