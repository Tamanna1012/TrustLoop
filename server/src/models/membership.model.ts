import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';

const membershipSchema = new Schema(
  {
    circleId: { type: Schema.Types.ObjectId, ref: 'Circle', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    payoutPosition: { type: Number, required: true, min: 0 },
    hasReceivedPayout: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'left', 'removed'], default: 'active' },
    joinedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// A user can only hold one membership per circle.
membershipSchema.index({ circleId: 1, userId: 1 }, { unique: true });

export type MembershipDoc = HydratedDocument<InferSchemaType<typeof membershipSchema>>;
export const Membership = model('Membership', membershipSchema);
