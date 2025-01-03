// IMPORTS
import { DataTypes } from "sequelize";
import db_config from '../config/dbConfig.js';


// MODEL DEFINITION
const CourseRuntime = db_config.define('CourseRuntime', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    course_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    start_time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    end_time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    day_of_week: {
        type: DataTypes.STRING,
        allowNull: false
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    tableName: 'course_runtimes',
    timestamps: false
});


// DEFAULT EXPORT
export default CourseRuntime;