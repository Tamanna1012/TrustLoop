import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address']
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['user', 'platformAdmin'], default: 'user' },
    trustScore: { type: Number, default: 100, min: 0, max: 100 },
    avatarUrl: { type: String }
  },
  { timestamps: true }
);

export type UserDoc = HydratedDocument<InferSchemaType<typeof userSchema>>;
export const User = model('User', userSchema);
