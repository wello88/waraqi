import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../db/connection.js';
import dotenv from 'dotenv';
import path from 'path';
import Services from './services.model.js';
dotenv.config({ path: path.resolve('./config/.env') });

class Ministries extends Model { }

Ministries.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false, unique: true },
        logo: { type: DataTypes.STRING, allowNull: true, defaultValue: process.env.SECURE_URL },
        location: { type: DataTypes.STRING, allowNull: false },
        siteLink: { type: DataTypes.STRING, allowNull: true },
        AddedBy: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
    },
    { sequelize, modelName: 'Ministries', tableName: 'ministries', timestamps: true }
);


export default Ministries;