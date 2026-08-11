import { Schema, model } from "mongoose";

export interface IUser {
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password_hash: {
      type: String,
      required: true,
      select: false,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    versionKey: false,
  },
);

export const User = model<IUser>("User", userSchema);
