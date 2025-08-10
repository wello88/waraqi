import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../db/connection.js';
import dotenv from 'dotenv';
import path from 'path';
import Ministries from './ministries.model.js';
import User from './user.model.js';
dotenv.config({ path: path.resolve('./config/.env') });


class Services extends Model { }

Services.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        ministryId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'ministries', key: 'id' } },
        name: { type: DataTypes.STRING, allowNull: false, unique: true },
        document: { type: DataTypes.STRING, allowNull: true },
        steps: { type: DataTypes.STRING, allowNull: true },
        price: { type: DataTypes.FLOAT, allowNull: false },
        duration: { type: DataTypes.INTEGER, allowNull: false }, // Duration in minutes
        locationAndTime: { type: DataTypes.STRING, allowNull: true },
        info: { type: DataTypes.STRING, allowNull: true },
        ServiceLink: { type: DataTypes.STRING, allowNull: true },
        AddedBy: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
    },
    { sequelize, modelName: 'Services', tableName: 'services', timestamps: true }
);


export default Services;