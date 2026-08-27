import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';

const circleSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    contributionAmount: { type: Number, required: true, min: 1 },
    cycleFrequency: { type: String, enum: ['weekly', 'monthly'], required: true },
    maxMembers: { type: Number, required: true, min: 2, max: 50 },
    status: {
      type: String,
      enum: ['forming', 'active', 'completed', 'cancelled'],
      default: 'forming'
    },
    payoutMethod: { type: String, enum: ['roundRobin', 'bidding'], default: 'roundRobin' },
    startDate: { type: Date },
    inviteCode: { type: String, required: true, unique: true, index: true }
  },
  { timestamps: true }
);

export type CircleDoc = HydratedDocument<InferSchemaType<typeof circleSchema>>;
export const Circle = model('Circle', circleSchema);
