import mongoose, { Schema, Document } from "mongoose";

export interface IAutomationStep {
  id: string;
  type: "SEND_EMAIL" | "DELAY" | "ADD_TAG" | "REMOVE_TAG";
  templateId?: mongoose.Types.ObjectId;
  delayDays?: number;
  delayHours?: number;
  tagId?: mongoose.Types.ObjectId;
}

export interface IAutomationRule extends Document {
  name: string;
  triggerType: "SUBSCRIBER_JOIN" | "INQUIRY_SUBMIT";
  steps: IAutomationStep[];
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
  updatedAt: Date;
}

const AutomationRuleSchema = new Schema<IAutomationRule>(
  {
    name: { type: String, required: true, trim: true },
    triggerType: {
      type: String,
      enum: ["SUBSCRIBER_JOIN", "INQUIRY_SUBMIT"],
      required: true,
      index: true,
    },
    steps: [
      {
        id: { type: String, required: true },
        type: { type: String, enum: ["SEND_EMAIL", "DELAY", "ADD_TAG", "REMOVE_TAG"], required: true },
        templateId: { type: Schema.Types.ObjectId, ref: "EmailTemplate" },
        delayDays: { type: Number, default: 0 },
        delayHours: { type: Number, default: 0 },
        tagId: { type: Schema.Types.ObjectId, ref: "Tag" },
      },
    ],
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE", index: true },
  },
  { timestamps: true }
);

export const AutomationRule =
  mongoose.models.AutomationRule ||
  mongoose.model<IAutomationRule>("AutomationRule", AutomationRuleSchema);
export default AutomationRule;
