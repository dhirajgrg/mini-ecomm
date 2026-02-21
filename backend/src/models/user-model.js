//CORE MODULE
import mongoose from "mongoose";

//THIRD-PARTY MODULE
import bcrypt from "bcryptjs";


//SCHEMA DEFINE
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    select: false,
  },
  role: {
    type: String,
    role: {
      type: String,
      enum: ["USER", "ADMIN", "VENDOR"],
      default: "USER",
    },
    default: "USER",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});


//HASHING PASSWORD BEFORE SAVING TO DATABASE
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

const User = mongoose.model("User", userSchema);
export default User;
