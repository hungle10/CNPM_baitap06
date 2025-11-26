// import crypto from "crypto";
// import bcrypt from "bcrypt";
// import User from "../models/user.js";
// import sendMail from "../utils/sendMail.js";

// export const forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: "Email không tồn tại" });
//     }

//     // Tạo OTP 6 số
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();

//     user.otp = otp;
//     user.otpExpire = Date.now() + 5 * 60 * 1000; // 5 phút

//     await user.save();

//     const html = `
//         <h3>Mã OTP xác minh đặt lại mật khẩu</h3>
//         <p>OTP của bạn là:</p>
//         <h2>${otp}</h2>
//         <p>Mã có hiệu lực trong 5 phút.</p>
//     `;

//     await sendMail(user.email, "OTP Reset Password", html);

//     return res.status(200).json({ message: "OTP đã được gửi!" });
//   } catch (err) {
//     console.log("ERROR", err);
//     res.status(500).json({ message: "Lỗi server" });
//   }
// };

// export const resetPassword = async (req, res) => {
//   try {
//     const { email, otp, password } = req.body;

//     const user = await User.findOne({
//       email,
//       otp: otp,
//       otpExpire: { $gt: Date.now() },
//     });

//     if (!user) {
//       return res
//         .status(400)
//         .json({ message: "OTP không hợp lệ hoặc đã hết hạn" });
//     }

//     // Mã hoá mật khẩu mới
//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(password, salt);

//     // Xóa OTP
//     user.otp = "";
//     user.otpExpire = null;

//     await user.save();

//     return res.json({ message: "Đặt mật khẩu thành công!" });
//   } catch (err) {
//     console.log("RESET ERROR", err);
//     res.status(500).json({ message: "Lỗi server" });
//   }
// };

// export const checkOTP = async (req, res) => {
//   const { email, otp } = req.body;

//   const user = await User.findOne({
//     email,
//     otp,
//     otpExpire: { $gt: Date.now() },
//   });

//   if (!user) {
//     return res.status(400).json({ message: "OTP không đúng hoặc đã hết hạn" });
//   }

//   return res.json({ message: "OTP hợp lệ" });
// };

import bcrypt from "bcrypt";
import User from "../models/user.js";
import sendMail from "../utils/sendMail.js";
import { Op } from "sequelize"; // ⭐ BẮT BUỘC

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Email không tồn tại" });
    }

    // Tạo OTP 6 số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpire = new Date(Date.now() + 5 * 60 * 1000);

    await user.save();

    const html = `
        <h3>Mã OTP xác minh đặt lại mật khẩu</h3>
        <p>OTP của bạn là:</p>
        <h2>${otp}</h2>
        <p>Mã có hiệu lực trong 5 phút.</p>
    `;

    await sendMail(user.email, "OTP Reset Password", html);

    return res.status(200).json({ message: "OTP đã được gửi!" });
  } catch (err) {
    console.log("ERROR", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const checkOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({
      where: {
        email,
        otp,
        otpExpire: { [Op.gt]: new Date() }, // ⭐ Sequelize
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "OTP không đúng hoặc đã hết hạn",
      });
    }

    return res.json({ message: "OTP hợp lệ" });
  } catch (err) {
    console.log("CHECK OTP ERROR", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    const user = await User.findOne({
      where: {
        email,
        otp,
        otpExpire: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "OTP không hợp lệ hoặc đã hết hạn",
      });
    }

    // Hash mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    user.otp = "";
    user.otpExpire = null;

    await user.save();

    return res.json({ message: "Đặt mật khẩu thành công!" });
  } catch (err) {
    console.log("RESET ERROR:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};
