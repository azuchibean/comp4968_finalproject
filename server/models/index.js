// IMPORTS
import Course from "./Course.js";
import CourseRuntime from "./CourseRuntime.js";
import Enrollment from "./Enrollment.js";
import Faculty from "./Faculty.js";
import FacultyAvailability from "./FacultyAvailability.js";
import Student from "./Student.js";
import Waitlist from "./Waitlist.js";
import User from "./User.js";


// ASSOCIATIONS
// COURSE
Course.hasMany(CourseRuntime, { foreignKey: 'course_id', as: 'course_runtime' });
Course.hasMany(Enrollment, { foreignKey: 'course_id', as: 'enrollment' });
Course.hasMany(Waitlist, { foreignKey: 'course_id', as: 'waitlist' });
Course.belongsTo(Faculty, { foreignKey: 'faculty_id', as: 'faculty' });

// COURSE RUNTIME
CourseRuntime.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

// ENROLLMENT
Enrollment.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
Enrollment.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

// FACULTY
Faculty.hasMany(Course, { foreignKey: 'faculty_id', as: 'course' });
Faculty.hasMany(FacultyAvailability, { foreignKey: 'faculty_id', as: 'availability' });
Faculty.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// FACULTY AVAILABILITY
FacultyAvailability.belongsTo(Faculty, { foreignKey: 'faculty_id', as: 'faculty' });

// STUDENT
Student.hasMany(Enrollment, { foreignKey: 'student_id', as: 'enrollment' });
Student.hasMany(Waitlist, { foreignKey: 'student_id', as: 'waitlist' });
Student.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// WAITLIST
Waitlist.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
Waitlist.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

// USER
User.hasOne(Faculty, { foreignKey: 'user_id', as: 'faculty' });
User.hasOne(Student, { foreignKey: 'user_id', as: 'student' });
