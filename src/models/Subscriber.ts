import mongoose, { Schema, Document } from "mongoose";

export interface ISubscriber extends Document {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  status: "SUBSCRIBED" | "UNSUBSCRIBED" | "BOUNCED" | "SPAM";
  tags: mongoose.Types.ObjectId[];
  groups: mongoose.Types.ObjectId[];
  customFields: Map<string, string>;
  unsubscribedAt?: Date;
  bouncedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriberSchema = new Schema<ISubscriber>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    company: { type: String, trim: true },
    phone: { type: String, trim: true },
    status: {
      type: String,
      enum: ["SUBSCRIBED", "UNSUBSCRIBED", "BOUNCED", "SPAM"],
      default: "SUBSCRIBED",
      index: true,
    },
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag", index: true }],
    groups: [{ type: Schema.Types.ObjectId, ref: "SubscriberGroup", index: true }],
    customFields: { type: Map, of: String, default: {} },
    unsubscribedAt: { type: Date },
    bouncedAt: { type: Date },
  },
  { timestamps: true }
);

export const Subscriber =
  mongoose.models.Subscriber || mongoose.model<ISubscriber>("Subscriber", SubscriberSchema);
export default Subscriber;
