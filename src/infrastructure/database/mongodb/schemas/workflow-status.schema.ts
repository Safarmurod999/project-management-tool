import { Schema } from 'mongoose';

export const WorkflowStatusSchema = new Schema(
  {
    workflowId: {
      type: Schema.Types.ObjectId,
      ref: 'Workflow',
      required: true,
    },
    statusId: {
      type: Schema.Types.ObjectId,
      ref: 'Status',
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

WorkflowStatusSchema.index({ workflowId: 1, statusId: 1 }, { unique: true });
