import { sequelize } from './connection.js';
import User from './models/user.model.js';
import Admin from './models/Admin.model.js';
import Services from './models/services.model.js';
import Ministries from './models/ministries.model.js';
import './associations.js'; // Ensure associations are set up

export const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected!');
    await sequelize.sync({ alter: true });
    console.log('Models synchronized!');
  } catch (err) {
    console.error('Error syncing database:', err);
  }
};

export {
  sequelize,
  User,
  Admin,
  Services,
  Ministries,
};



