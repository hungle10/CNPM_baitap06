require('dotenv').config();

const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

/**
 * Safe script to add missing columns to the Products table.
 * It will check whether columns exist and add them if missing.
 * Run: node ./src/utils/addProductColumns.js
 */

async function run() {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connection established.');

    const qi = sequelize.getQueryInterface();
    const table = 'Products';

    const columns = await qi.describeTable(table);

    const tasks = [];

    if (!('isOnPromotion' in columns)) {
      console.log('- Adding column isOnPromotion BOOL DEFAULT FALSE');
      tasks.push(
        qi.addColumn(table, 'isOnPromotion', {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        })
      );
    } else {
      console.log('- Column isOnPromotion already exists');
    }

    if (!('views' in columns)) {
      console.log('- Adding column views INT DEFAULT 0');
      tasks.push(
        qi.addColumn(table, 'views', {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        })
      );
    } else {
      console.log('- Column views already exists');
    }

    if (tasks.length === 0) {
      console.log('No changes required. Exiting.');
      return process.exit(0);
    }

    await Promise.all(tasks);
    console.log('✅ Migration complete — columns added.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err && err.message ? err.message : err);
    process.exit(1);
  }
}

if (require.main === module) run();

module.exports = run;
