import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../db/connection.js'
import dotenv from 'dotenv';
import path from 'path';
import User from './user.model.js';
dotenv.config({ path: path.resolve('./config/.env') })

class Admin extends Model { }

Admin.init(
    {
        //admin inherets from user
        AdminId: { type: DataTypes.INTEGER,primaryKey: true ,allowNull: false, references: { model: 'users', key: 'id' } },
        email: { type: DataTypes.STRING, allowNull: false, unique: true },
        ministryId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'ministries', key: 'id' } },
    },
    { sequelize, modelName: 'Admin', tableName: 'admins', timestamps: true }
);


export default Admin;