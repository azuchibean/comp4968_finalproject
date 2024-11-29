// IMPORTS
import { DataTypes } from "sequelize";
import db_config from '../config/dbConfig.js';


// MODEL DEFINITION
const Course = db_config.define('Course', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    faculty_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    course_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    course_description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    room_number: {
        type: DataTypes.STRING,
        allowNull: false
    },
    seats_available: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    total_seats: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    date_available: {
        type: DataTypes.DATEONLY,
        allowNull: false
    }
}, {
    tableName: 'courses',
    timestamps: false
});


// DEFAULT EXPORT
export default Course;