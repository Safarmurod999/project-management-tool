import { Schema } from 'mongoose';
export const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
    },
    isVerified: { type: Boolean, default: false }
  },
  { timestamps: true },
);
