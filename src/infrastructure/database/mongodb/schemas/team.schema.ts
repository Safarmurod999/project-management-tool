import { Schema } from "mongoose";
import { TeamStatus } from "src/infrastructure/common/enum";

export const TeamSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: null },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TeamStatus),
      default: TeamStatus.ACTIVE,
    },
  },
  { timestamps: true },
);
