import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';

const disputeSchema = new Schema(
  {
    circleId: { type: Schema.Types.ObjectId, ref: 'Circle', required: true, index: true },
    raisedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    againstUser: { type: Schema.Types.ObjectId, ref: 'User' },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    status: {
      type: String,
      enum: ['open', 'underReview', 'resolved', 'rejected'],
      default: 'open'
    },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolutionNote: { type: String, trim: true, maxlength: 1000 }
  },
  { timestamps: true }
);

export type DisputeDoc = HydratedDocument<InferSchemaType<typeof disputeSchema>>;
export const Dispute = model('Dispute', disputeSchema);
