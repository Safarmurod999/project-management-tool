import { Schema } from 'mongoose';

export const WorkflowTransitionSchema = new Schema(
  {
    workflowId: {
      type: Schema.Types.ObjectId,
      ref: 'Workflow',
      required: true,
    },
    fromStatusId: {
      type: Schema.Types.ObjectId,
      ref: 'Status',
      required: true,
    },
    toStatusId: {
      type: Schema.Types.ObjectId,
      ref: 'Status',
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

// One rule per direction; the prefix { workflowId, fromStatusId } also serves
// "which statuses can a card move to" lookups.
WorkflowTransitionSchema.index(
  { workflowId: 1, fromStatusId: 1, toStatusId: 1 },
  { unique: true },
);
