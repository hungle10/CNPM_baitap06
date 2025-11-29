// require("dotenv").config();
// const mongoose = require("mongoose");

// const dbState = [
//   {
//     value: 0,
//     label: "Disconnected",
//   },
//   {
//     value: 1,
//     label: "Connected",
//   },
//   {
//     value: 2,
//     label: "Connecting",
//   },
//   {
//     value: 3,
//     label: "Disconnecting",
//   },
// ];

// const connection = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_DB_URL);

//     const state = Number(mongoose.connection.readyState);
//     console.log(dbState.find((s) => s.value === state).label, "to database");
//   } catch (error) {
//     console.log("Database connection error:", error.message);
//     process.exit(1);
//   }
// };

// module.exports = connection;
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.MYSQL_DB,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
    dialect: "mysql",
    logging: false,
  }
);

module.exports = sequelize;