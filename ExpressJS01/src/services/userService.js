// require("dotenv").config();
// const User = require("../models/user");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");

// const saltRounds = 10;

// // =========================
// // CREATE USER
// // =========================
// const createUserService = async (name, email, password) => {
//   try {
//     // check user exist
//     const user = await User.findOne({ email });
//     if (user) {
//       console.log(`>>> user exist, chọn 1 email khác: ${email}`);
//       return null;
//     }

//     // hash user password
//     const hashPassword = await bcrypt.hash(password, saltRounds);

//     // save user to database
//     let result = await User.create({
//       name: name,
//       email: email,
//       password: hashPassword,
//       role: "User",
//     });

//     return result;
//   } catch (error) {
//     console.log(error);
//     return null;
//   }
// };

// // =========================
// // LOGIN
// // =========================
// const loginService = async (email, password) => {
//   try {
//     // fetch user by email
//     const user = await User.findOne({ email });
//     if (user) {
//       // compare password
//       const isMatchPassword = await bcrypt.compare(password, user.password);
//       if (!isMatchPassword) {
//         return {
//           EC: 2,
//           EM: "Email/Password không hợp lệ",
//         };
//       } else {
//         // create an access token
//         const payload = {
//           email: user.email,
//           name: user.name,
//         };

//         const access_token = jwt.sign(payload, process.env.JWT_SECRET, {
//           expiresIn: process.env.JWT_EXPIRE,
//         });

//         return {
//           EC: 0,
//           access_token,
//           user: {
//             email: user.email,
//             name: user.name,
//           },
//         };
//       }
//     } else {
//       return {
//         EC: 1,
//         EM: "Email/Password không hợp lệ",
//       };
//     }
//   } catch (error) {
//     console.log(error);
//     return null;
//   }
// };

// // =========================
// // GET USERS (bỏ password)
// // =========================
// const getUserService = async () => {
//   try {
//     let result = await User.find({}).select("-password");
//     return result;
//   } catch (error) {
//     console.log(error);
//     return null;
//   }
// };

// module.exports = {
//   createUserService,
//   loginService,
//   getUserService,
// };

const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const createUserService = async (name, email, password) => {
  // Check existing user
  const isExist = await User.findOne({ where: { email } });
  if (isExist) {
    return { EC: 1, EM: "Email đã tồn tại" };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user
  await User.create({
    name,
    email,
    password: hashedPassword,
  });

  return { EC: 0, EM: "Tạo tài khoản thành công" };
};

const loginService = async (email, password) => {
  const foundUser = await User.findOne({ where: { email } });

  if (!foundUser) {
    return { EC: 1, EM: "Email không tồn tại" };
  }

  // Compare hashed password
  const isValid = await bcrypt.compare(password, foundUser.password);
  if (!isValid) {
    return { EC: 1, EM: "Sai mật khẩu" };
  }

  // Generate JWT
  const payload = {
    email: foundUser.email,
    name: foundUser.name,
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  return {
    EC: 0,
    EM: "Đăng nhập thành công",
    access_token: accessToken,
    user: foundUser,
  };
};

const getUserService = async () => {
  const list = await User.findAll();
  return { EC: 0, data: list };
};

module.exports = {
  createUserService,
  loginService,
  getUserService,
};