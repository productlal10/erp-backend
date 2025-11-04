// const { Sequelize } = require('sequelize');
// const dotenv = require('dotenv');
// dotenv.config();

// // Create a new Sequelize instance
// const sequelize = new Sequelize(
//   process.env.DB_NAME,
//   process.env.DB_USER,
//   process.env.DB_PASSWORD,
//   {
//     host: process.env.DB_HOST,
//     dialect: process.env.DB_DIALECT,
//     logging: false, // Turn off SQL logging in the console
//   }
// );

// // Export the instance for use in other files
// module.exports = sequelize;



const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

// Sequelize instance for PostgreSQL
const sequelize = new Sequelize(
  process.env.DB_NAME,       // LAL10_ERP
  process.env.DB_USER,       // postgres
  process.env.DB_PASSWORD,   // yourpassword
  {
    host: process.env.DB_HOST,      // localhost
    port: process.env.DB_PORT,      // 5432
    dialect: process.env.DB_DIALECT, // postgres
    logging: false, // turn off SQL logging
  }
);

module.exports = sequelize;

