import { Schema } from 'mongoose';

export const RolePermissionSchema = new Schema(
  {
    roleId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Role', 
      required: true,
      index: true,
    },
    permissionId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Permission', 
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

// Compound unique index to ensure no duplicate role-permission pairs
RolePermissionSchema.index({ roleId: 1, permissionId: 1 }, { unique: true });

// Index for efficient reverse lookups (finding all roles with a specific permission)
RolePermissionSchema.index({ permissionId: 1, roleId: 1 });
