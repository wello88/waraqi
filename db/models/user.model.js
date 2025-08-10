import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../db/connection.js';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve('./config/.env') });

class User extends Model {}

User.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userName: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    profilePhoto: { type: DataTypes.JSONB, allowNull: true, defaultValue: [process.env.SECURE_URL] },
    role: { type: DataTypes.ENUM('admin', 'superadmin'), allowNull: false },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { sequelize, modelName: 'User', tableName: 'users', timestamps: true }
);

export default User;