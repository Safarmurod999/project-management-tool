import { Schema } from 'mongoose';
import { ProjectStatus } from 'src/infrastructure/common/enum';

export const ProjectSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: null },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ProjectStatus),
      default: ProjectStatus.ACTIVE,
    },
  },
  { timestamps: true },
);
