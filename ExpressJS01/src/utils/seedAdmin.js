const bcrypt = require('bcrypt');
const User = require('../models/user');

const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123';

    const exist = await User.findOne({ where: { email: adminEmail } });
    if (exist) {
      console.log(`Admin user ${adminEmail} already exists. Skipping.`);
      return;
    }

    const hashed = await bcrypt.hash(adminPassword, 10);

    await User.create({
      name: 'Administrator',
      email: adminEmail,
      password: hashed,
      role: 'admin',
    });

    console.log(`✅ Admin user created with email ${adminEmail}.`);
  } catch (err) {
    console.error('Failed to seed admin:', err);
  }
};

module.exports = seedAdmin;
