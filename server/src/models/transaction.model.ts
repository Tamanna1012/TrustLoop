import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';

const transactionSchema = new Schema(
  {
    circleId: { type: Schema.Types.ObjectId, ref: 'Circle', required: true, index: true },
    cycleId: { type: Schema.Types.ObjectId, ref: 'Cycle', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['contribution', 'payout'], required: true },
    amount: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
    paymentReference: { type: String }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// The ledger is append-only: every write is a new document, never a mutation
// of an existing one, so the transaction history stays a trustworthy audit trail.
const blockMutation = function (this: unknown, next: (err?: Error) => void) {
  next(new Error('Transactions are append-only and cannot be updated or deleted.'));
};
transactionSchema.pre('updateOne', blockMutation);
transactionSchema.pre('findOneAndUpdate', blockMutation);
transactionSchema.pre('deleteOne', blockMutation);
transactionSchema.pre('findOneAndDelete', blockMutation);

// A member can only contribute once per cycle — enforced at the DB level
// (not just in application code) so a race between two requests can't
// double-record the same payment.
transactionSchema.index(
  { cycleId: 1, userId: 1, type: 1 },
  { unique: true, partialFilterExpression: { type: 'contribution' } }
);

export type TransactionDoc = HydratedDocument<InferSchemaType<typeof transactionSchema>>;
export const Transaction = model('Transaction', transactionSchema);
