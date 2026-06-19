import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    dateOfBirth: Date,
    isVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: String,
    lastLogin: Date,
    isBlocked: {
      type: Boolean,
      default: false,
    },
    addresses: [
      {
        fullName: String,
        phone: String,
        houseNo: String,
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: String,
        isDefault: Boolean,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);