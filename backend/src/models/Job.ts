import mongoose, { Schema } from "mongoose";

export interface IJob {
  company: string;
  role: string;
  status: "applied" | "interview" | "offer" | "rejected";
  appliedDate: Date;
}

const jobSchema = new Schema<IJob>(
  {
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["applied", "interview", "offer", "rejected"],
      default: "applied"
    },
    appliedDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const Job = mongoose.model<IJob>("Job", jobSchema);

export default Job;
