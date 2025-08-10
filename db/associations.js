import User from './models/user.model.js';
import Admin from './models/Admin.model.js';
import Ministries from './models/ministries.model.js';
import Services from './models/services.model.js';

// User <-> Admin
User.hasMany(Admin, { foreignKey: 'AdminId', as: 'admin' });
Admin.belongsTo(User, { foreignKey: 'AdminId', as: 'user' });

// Admin <-> Ministries
Admin.belongsTo(Ministries, { foreignKey: 'ministryId', as: 'ministry' });
Ministries.hasMany(Admin, { foreignKey: 'ministryId', as: 'admins' });

// Ministries <-> Services
Ministries.hasMany(Services, { foreignKey: 'ministryId', as: 'services' });
Services.belongsTo(Ministries, { foreignKey: 'ministryId', as: 'ministry' });

// User <-> Services
Services.belongsTo(User, { foreignKey: 'AddedBy', as: 'addedBy' });
User.hasMany(Services, { foreignKey: 'AddedBy', as: 'servicesAdded' });