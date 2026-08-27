import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true },
    message: { type: String, required: true, trim: true, maxlength: 300 },
    isRead: { type: Boolean, default: false }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

notificationSchema.index({ userId: 1, isRead: 1 });

export type NotificationDoc = HydratedDocument<InferSchemaType<typeof notificationSchema>>;
export const Notification = model('Notification', notificationSchema);
