// require("dotenv").config();

// // import các nguồn cần dùng
// const express = require("express");
// const configViewEngine = require("./config/viewEngine");
// const apiRoutes = require("./routes/api");
// const connection = require("./config/database");
// const { getHomepage } = require("./controllers/homeController");
// const cors = require("cors");

// const app = express(); // cấu hình app là express

// // cấu hình port, nếu không thấy PORT trong .env thì dùng 8888
// const port = process.env.PORT || 8888;

// // config cors
// app.use(cors());

// // config req.body cho json
// app.use(express.json());

// // config req.body cho form data
// app.use(express.urlencoded({ extended: true }));

// // config template engine (EJS)
// configViewEngine(app);

// // config route cho view EJS
// const webAPI = express.Router();
// webAPI.get("/", getHomepage);
// app.use("/", webAPI);

// // khai báo route cho API
// app.use("/v1/api", apiRoutes);

// // chạy server và kết nối DB
// (async () => {
//   try {
//     // kết nối database using mongoose
//     await connection();

//     // lắng nghe port
//     app.listen(port, () => {
//       console.log(`Backend NodeJS App listening on port ${port}`);
//     });
//   } catch (error) {
//     console.log(">>> Error connect to DB: ", error);
//   }
// })();

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const initViewEngine = require("./config/viewEngine");
const apiRoutes = require("./routes/api");
const sequelize = require("./config/database");
const { getHomepage } = require("./controllers/homeController");

const app = express();
const PORT = process.env.PORT ?? 8888;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// View Engine
initViewEngine(app);

// Web routes
const routerWeb = express.Router();
routerWeb.get("/", getHomepage);
app.use("/", routerWeb);

// API routes
app.use("/v1/api", apiRoutes);

// Start server with DB connection
(async function bootstrap() {
  try {
    await sequelize.authenticate();
    console.log(" Database connection established");

    await sequelize.sync();
    console.log(" All models synchronized");

    // Seed demo data if database is empty (products and optional admin user)
    try {
      const seedProducts = require("./utils/seedProducts");
      const seedAdmin = require("./utils/seedAdmin");

      await seedProducts();
      await seedAdmin();
    } catch (err) {
      console.warn("Seeding skipped or failed:", err && err.message ? err.message : err);
    }

    app.listen(PORT, () =>
      console.log(` Server is up and running at port ${PORT}`)
    );
  } catch (err) {
    console.error(" Failed to initialize the server:", err);
  }
})();