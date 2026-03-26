import { Schema } from 'mongoose';
import { ScopeType } from 'src/infrastructure/common/enum';

export const MembershipSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    scopeType: {
      type: String,
      enum: Object.values(ScopeType),
      required: true,
      index: true,
    },
    scopeId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    roleId: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
      index: true,
    },
    override: {
      type: Schema.Types.Boolean,
      required:false,
      default :false
    }
  },
  { timestamps: true },
);

MembershipSchema.index(
  { userId: 1, scopeType: 1, scopeId: 1 },
  { unique: true },
);
