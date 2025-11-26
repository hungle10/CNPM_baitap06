// require("dotenv").config();
// const jwt = require("jsonwebtoken");

// const auth = (req, res, next) => {
//   // Các route không cần xác thực
//   const white_lists = ["/", "/register", "/login"];

//   if (white_lists.find((item) => "/v1/api" + item === req.originalUrl)) {
//     return next();
//   }

//   // Kiểm tra token có trong header không
//   if (req.headers?.authorization?.split(" ")?.[1]) {
//     const token = req.headers.authorization.split(" ")[1];

//     try {
//       // Verify token
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       req.user = {
//         email: decoded.email,
//         name: decoded.name,
//         createdBy: "hoidanit",
//       };

//       console.log(">>> check token:", decoded);

//       return next();
//     } catch (error) {
//       return res.status(401).json({
//         message: "Token bị hết hạn/hoặc không hợp lệ",
//       });
//     }
//   } else {
//     return res.status(401).json({
//       message: "Bạn chưa truyền Access Token ở header/Hoặc token bị hết hạn",
//     });
//   }
// };

// module.exports = auth;

require("dotenv").config();
const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  // Những API không cần token
  const whiteLists = [
    "/register",
    "/login",
    "/forgot-password",
    "/check-otp",
    "/reset-password",
  ];

  // Nếu request đang vào API không cần auth → cho qua
  if (whiteLists.includes(req.originalUrl.replace("/v1/api", ""))) {
    return next();
  }

  // Lấy token từ header
  const authorization = req.headers?.authorization;
  if (!authorization)
    return res.status(401).json({
      message: "Thiếu Access Token trong header",
    });

  const token = authorization.split(" ")[1];
  if (!token)
    return res.status(401).json({
      message: "Token không hợp lệ",
    });

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      email: decoded.email,
      name: decoded.name,
    };

    console.log(">>> Token verified:", decoded);

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Token hết hạn hoặc không hợp lệ",
    });
  }
};

module.exports = auth;
