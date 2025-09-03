import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const profile = new Schema({
  firstName: {
    type: String,
    trim: true,
    required: true,
    lowecase: true,
  },
  lastName: {
    type: String,
    trim: true,
    lowecase: true,
  },
  avatar: {
    type: String,
    required: true,
  },
  dob: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
  },
});

const contact = new Schema({
  countryCode: {
    type: String,
    minlength: 1,
    maxlength: 4,
    match: /^[0-9]+$/,
  },
  number: {
    type: String,
    minlength: 6,
    maxlength: 15,
  },
  default: {
    type: Boolean,
    default: true,
  },
});

const address = new Schema({
  address: {
    type: String,
    trim: true,
    lowecase: true,
  },
  city: {
    type: String,
    trim: true,
    lowecase: true,
  },
  state: {
    type: String,
    trim: true,
    lowecase: true,
  },
  country: {
    type: String,
    trim: true,
    lowecase: true,
  },
  postcode: {
    type: String,
    trim: true,
    lowecase: true,
  },
  timezone: {
    type: String,
    trim: true,
  },
});

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      lowecase: true,
      trim: true,
      index: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    refreshToken: {
      type: String,
    },

    // nested objects
    profile: {
      type: profile,
    },
    address: {
      type: address,
    },
    contact: {
      type: contact,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  console.log("password hashing..");

  this.password = await bcrypt.hash(this.password, 10);
  console.log("password hashing completed..");
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this.id,
      email: this.email,
      username: this.username,
      firstName: this.profile.firstName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this.id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
