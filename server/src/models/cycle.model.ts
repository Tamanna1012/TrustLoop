import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';

const cycleSchema = new Schema(
  {
    circleId: { type: Schema.Types.ObjectId, ref: 'Circle', required: true, index: true },
    cycleNumber: { type: Number, required: true, min: 1 },
    dueDate: { type: Date, required: true },
    payoutRecipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'collecting', 'completed'], default: 'pending' },
    totalCollected: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

// A circle can't have two cycles sharing the same position in its rotation.
cycleSchema.index({ circleId: 1, cycleNumber: 1 }, { unique: true });

export type CycleDoc = HydratedDocument<InferSchemaType<typeof cycleSchema>>;
export const Cycle = model('Cycle', cycleSchema);
