const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "'name' is required"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "'email' is required"],
    unique: true,
    lowercase: true,
    validate: value => {
      if (!validator.isEmail(value)) {
        throw new Error({ error: "Invalid email address" });
      }
    }
  },
  password: {
    type: String,
    required: [true, "'password' is required"],
    minLength: [8, "password must be at least 8 charaters"]
  },
  role: {
    type: String,
    required: [true, "'role' is required"],
    enum: ["admin", "student", "supervisor"]
  },
  token: {
    type: String
  }
});

userSchema.pre("save", async function(next) {
  // Hash the password before saving the user model
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

userSchema.methods.generateAuthToken = async function() {
  // Generate an auth token for the user
  const user = this;
  const token = jwt.sign(
    { _id: user._id, role: user.role },
    process.env.JWT_KEY
  );
  user.token = token;
  await user.save();
  return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
  // Search for a user by email and password.
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error({ error: "Invalid login credentials" });
  }
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    throw new Error({ error: "Invalid login credentials" });
  }
  return user;
};

const User = new mongoose.model("User", userSchema);

module.exports = User;
