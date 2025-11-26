// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true, trim: true },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     lowercase: true,
//     trim: true,
//   },
//   password: { type: String, required: true },
//   role: { type: String, default: "user" },
//   otp: { type: String, default: "" },
//   otpExpire: { type: Date, default: null },

//   resetPasswordExpire: { type: Date, default: null },
// });

// // 👇 Quan trọng để tránh lỗi OverwriteModelError
// const User = mongoose.models.User || mongoose.model("User", userSchema);

// module.exports = User;

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define("User", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  role: {
    type: DataTypes.STRING,
    defaultValue: "user",
  },

  otp: {
    type: DataTypes.STRING,
    defaultValue: "",
  },

  otpExpire: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

module.exports = User;
