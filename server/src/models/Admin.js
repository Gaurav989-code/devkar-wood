import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Admin name is required"],
      trim: true,
      minlength: [2, "Admin name must contain at least 2 characters"],
      maxlength: [60, "Admin name cannot exceed 60 characters"],
    },

    email: {
      type: String,
      required: [true, "Admin email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Admin password is required"],
      minlength: [8, "Password must contain at least 8 characters"],
      select: false,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
      match: [
        /^$|^[6-9]\d{9}$/,
        "Please enter a valid 10-digit Indian mobile number",
      ],
    },

    avatar: {
      publicId: {
        type: String,
        trim: true,
        default: "",
      },

      url: {
        type: String,
        trim: true,
        default: "",
      },
    },

    role: {
      type: String,
      enum: ["admin"],
      default: "admin",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },

    passwordChangedAt: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,

    toJSON: {
      transform(document, returnedObject) {
        delete returnedObject.password;
        delete returnedObject.passwordChangedAt;

        return returnedObject;
      },
    },
  },
);

/*
|--------------------------------------------------------------------------
| Hash password before saving
|--------------------------------------------------------------------------
*/

adminSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);

  if (!this.isNew) {
    this.passwordChangedAt = new Date(Date.now() - 1000);
  }
});

/*
|--------------------------------------------------------------------------
| Compare login password
|--------------------------------------------------------------------------
*/

adminSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

/*
|--------------------------------------------------------------------------
| Check whether password changed after JWT creation
|--------------------------------------------------------------------------
*/

adminSchema.methods.changedPasswordAfter = function (jwtIssuedAt) {
  if (!this.passwordChangedAt) {
    return false;
  }

  const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);

  return changedTimestamp > jwtIssuedAt;
};

/*
|--------------------------------------------------------------------------
| Indexes
|--------------------------------------------------------------------------
*/

adminSchema.index({
  isActive: 1,
  createdAt: -1,
});

/*
|--------------------------------------------------------------------------
| Model
|--------------------------------------------------------------------------
*/

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
