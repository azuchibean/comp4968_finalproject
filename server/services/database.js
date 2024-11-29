// IMPORTS
import Course from '../models/Course.js';
import CourseRuntime from '../models/CourseRuntime.js';
import Enrollment from '../models/Enrollment.js';
import Faculty from '../models/Faculty.js';
import FacultyAvailability from '../models/FacultyAvailability.js';
import Student from '../models/Student.js';
import Waitlist from '../models/Waitlist.js';
import User from '../models/User.js';



// CONSTANTS


// CLASS
class Database {
    constructor(dbConfig) {
        this.dbConfig = dbConfig;
    }

    async getUser(email) {
        const faculty = await Faculty.findOne({
            where: { email }
        });
        if (faculty) {
            const user = await User.findOne({
                where: { id: faculty.user_id }
            });
            return user;
        }
        const student = await Student.findOne({
            where: { email }
        });
        if (student) {
            const user = await User.findOne({
                where: { id: student.user_id }
            });
            return user;
        }
        return null;
    }

    async createUser(userId, email, role, dateOfBirth, firstName, lastName, phoneNumber) {
        await User.create({
            id: userId,
            role,
            is_verified: false,
        });
        if (role > 0) {
            await Faculty.create({
                user_id: userId,
                first_name: firstName,
                last_name: lastName,
                email,
                date_of_birth: dateOfBirth,
                phone_number: phoneNumber,
                is_admin: role === 2
            });
        } else {
            await Student.create({
                user_id: userId,
                first_name: firstName,
                last_name: lastName,
                email,
                date_of_birth: dateOfBirth,
                phone_number: phoneNumber
            });
        }
    }

    async verifyUser(userId) {
        await User.update({ is_verified: true }, { where: { id: userId } });
    }

    async getAllCourses() {
        const courses = await Course.findAll();
        // for course in courses, get the course runtimes and the faculty name
        for (let i = 0; i < courses.length; i++) {
            const course = courses[i];
            const courseRuntimes = await CourseRuntime.findAll({
                where: { course_id: course.id }
            });
            course.dataValues.courseRuntimes = courseRuntimes;
            const faculty = await Faculty.findOne({
                where: { id: course.faculty_id }
            });
            course.dataValues.facultyName = faculty.first_name + ' ' + faculty.last_name;
        }
        return courses;
    }

    async createCourse(facultyId, courseName, courseDescription, roomNumber, seatsAvailable, totalSeats, dateAvailable) {
        console.log('Creating course:', facultyId, courseName, courseDescription, roomNumber, seatsAvailable, totalSeats, dateAvailable);
        const course = await Course.create({
            faculty_id: facultyId,
            course_name: courseName,
            course_description: courseDescription,
            room_number: roomNumber,
            seats_available: seatsAvailable,
            total_seats: totalSeats,
            date_available: dateAvailable
        })
        return course.id;

    }

    async deleteCourse(courseId) {
        console.log('Deleting course:', courseId);
        await Course.destroy({
            where: { id: courseId }
        });
    }

    async getCoursesByStudentId(studentId) {
        const courses = await Course.findAll({
            include: [
                {
                    model: Enrollment,
                    as: 'enrollment',
                    where: { student_id: studentId }
                }
            ]
        });
        for (let i = 0; i < courses.length; i++) {
            const course = courses[i];
            const courseRuntimes = await CourseRuntime.findAll({
                where: { course_id: course.id }
            });
            course.dataValues.courseRuntimes = courseRuntimes;
            const faculty = await Faculty.findOne({
                where: { id: course.faculty_id }
            });
            course.dataValues.facultyName = faculty.first_name + ' ' + faculty.last_name;
        }
        return courses;
    }

    async getCoursesByFacultyId(facultyId) {
        const courses = await Course.findAll({
            where: { faculty_id: facultyId }
        });
        for (let i = 0; i < courses.length; i++) {
            const course = courses[i];
            const courseRuntimes = await CourseRuntime.findAll({
                where: { course_id: course.id }
            });
            course.dataValues.courseRuntimes = courseRuntimes;
            const faculty = await Faculty.findOne({
                where: { id: course.faculty_id }
            });
            course.dataValues.facultyName = faculty.first_name + ' ' + faculty.last_name;
        }
        return courses;
    }

    async enrollStudent(studentId, courseId) {
        // Check if student is already enrolled
        const enrollment = await Enrollment
            .findOne({
                where: {
                    student_id: studentId,
                    course_id: courseId
                }
            });
        if (enrollment) {
            throw new Error('Student is already enrolled in this course');
        }
        // Check if course is full
        const course = await Course.findOne({
            where: { id: courseId }
        });
        if (course.seats_available <= 0) {
            // add student to waitlist
            await Waitlist.create({
                student_id: studentId,
                course_id: courseId
            });
            throw new Error('Course is full');
        }
        // Check if student is already waitlisted
        const waitlist = await Waitlist
            .findOne({
                where: {
                    student_id: studentId,
                    course_id: courseId
                }
            });
        if (waitlist) {
            throw new Error('Student is already waitlisted for this course');
        }
        // Enroll student
        await Enrollment.create({
            student_id: studentId,
            course_id: courseId,
            status: 'unlocked' // hardcoding a default as unlocked for now, will be updated for next milestone
        });
        await Course.update(
            { seats_available: course.seats_available - 1 },
            { where: { id: courseId } }
        );
    }

    async deleteEnrollment(studentId, courseId) {
        await Enrollment.destroy({
            where: {
                student_id: studentId,
                course_id: courseId
            }
        });
        const course = await Course.findOne({
            where: { id: courseId }
        });
        await Course.update(
            { seats_available: course.seats_available + 1 },
            { where: { id: courseId } }
        );
    }

    async getAllFaculty() {
        const faculty = await Faculty.findAll();
        return faculty;
    }

    async addFaculty(userId, firstName, lastName, email, phoneNumber, dateOfBirth, isAdmin) {
        console.log('Adding new Faculty:', userId, firstName, lastName, email, phoneNumber, dateOfBirth, isAdmin);
        await Faculty.create({
            user_id: userId,
            first_name: firstName,
            last_name: lastName,
            email: email,
            phone_number: phoneNumber,
            date_of_birth: dateOfBirth,
            is_admin: isAdmin
        });
    }

    async deleteFaculty(facultyId) {
        console.log('Deleting faculty:', facultyId);
        await Faculty.destroy({
            where: { id: facultyId }
        });
    }

    // Add faculty availability
    async addAvailability(facultyId, day, startTime, endTime, available) {
        const newAvailability = await FacultyAvailability.create({
            faculty_id: facultyId,
            day,
            start_time: startTime,
            end_time: endTime,
            available
        });
        return newAvailability;
    }

    // Get availability by faculty ID
    async getAvailabilityByFacultyId(facultyId) {
        const availability = await FacultyAvailability.findAll({
            where: { faculty_id: facultyId }
        });
        return availability;
    }


    // Delete availability
    async deleteAvailabilityById(id) {
        const deletedRows = await FacultyAvailability.destroy({
            where: { id }
        });
        return deletedRows;
    }

    async getFacultyById(facultyId) {
        const faculty = await Faculty.findOne({
            where: { id: facultyId }
        });
        return faculty;
    }

    async getUserById(userId) {
        const user = await User.findOne({
            where: { id: userId }
        });
        if (user.role > 0) {
            const faculty = await Faculty.findOne({
                where: { user_id: userId }
            });
            user.dataValues.profile = faculty;
        } else {
            const student = await Student.findOne({
                where: { user_id: userId }
            });
            user.dataValues.profile = student;
        }
        return user;
    }

    async getAllUsers() {
        const users = await User.findAll();
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            if (user.role > 0) {
                const faculty = await Faculty.findOne({
                    where: { user_id: user.id }
                });
                user.dataValues.profile = faculty;
            } else {
                const student = await Student.findOne({
                    where: { user_id: user.id }
                });
                user.dataValues.profile = student;
            }
        }
        return users;
    }

    async createCourseRuntime(courseId, start_date, end_date, start_time, end_time, day_of_week, location) {
        // Check if course exists
        const course = await Course.findOne({
            where: { id: courseId }
        });
        if (!course) {
            throw new Error('Course does not exist');
        }
        // convert start_date and end_date to date objects with format YYYY-MM-DD
        start_date = new Date(start_date);
        end_date = new Date(end_date);

        const courseRuntime = await CourseRuntime.findOne({
            where: {
                course_id: courseId,
                start_date,
                end_date,
                start_time,
                end_time,
                day_of_week,
                location
            }
        });
        if (courseRuntime) {
            throw new Error('Course runtime already exists');
        }
        await CourseRuntime.create({
            course_id: courseId,
            start_date,
            end_date,
            start_time,
            end_time,
            day_of_week,
            location
        });
    }

    async getAvailableFacultyByTimeslots(timeSlots) {
        let faculty = await FacultyAvailability.findAll({
            where: {
                day: timeSlots[0].day,
                start_time: timeSlots[0].startTime,
                end_time: timeSlots[0].endTime,
                available: true
            }
        });
        for (let i = 1; i < timeSlots.length; i++) {
            const newFaculty = await FacultyAvailability.findAll({
                where: {
                    day: timeSlots[i].day,
                    start_time: timeSlots[i].startTime,
                    end_time: timeSlots[i].endTime,
                    available: true
                }
            });
            faculty = faculty.filter(f => newFaculty.some(nf => nf.faculty_id === f.faculty_id));
        }
        faculty = await Faculty.findAll({
            where: {
                id: faculty.map(f => f.faculty_id)
            }
        });
        return faculty;
    }

    async getFacultyIdByUserId(userId) {
        const faculty = await Faculty.findOne({
            where: { user_id: userId }
        });
        return faculty.id;
    }

    async updateFacultyAvailability(facultyId, availabilityList) {
        try {
            // Delete existing availability entries for the faculty
            await FacultyAvailability.destroy({
                where: { faculty_id: facultyId }
            });

            // Bulk insert new availability entries
            const newAvailabilities = availabilityList.map((entry) => ({
                faculty_id: facultyId,
                day: entry.day,
                start_time: entry.start_time,
                end_time: entry.end_time,
                available: entry.available,
            }));

            const createdEntries = await FacultyAvailability.bulkCreate(newAvailabilities);
            return createdEntries;
        } catch (error) {
            console.error('Error updating availability in Database:', error);
            throw new Error('Failed to update faculty availability');
        }
    }

    async deleteAvailabilityByFacultyId(facultyId) {
        await FacultyAvailability.destroy({
            where: { faculty_id: facultyId }
        });
    }

    async createAvailability(facultyId, dayOfWeek, startTime, endTime) {
        await FacultyAvailability.create({
            faculty_id: facultyId,
            day: dayOfWeek,
            start_time: startTime,
            end_time: endTime,
            available: true
        });
    }

    async getCourseById(courseId) {
        return await Course.findOne({ where: { id: courseId } });
    }

    async getCourseRuntimesByCourseId(courseId) {
        return await CourseRuntime.findAll({ where: { course_id: courseId } });
    }

    async updateCourse(courseId, facultyId, courseName, courseDescription, roomNumber, seatsAvailable, totalSeats) {
        await Course.update(
          {
            faculty_id: facultyId,
            course_name: courseName,
            course_description: courseDescription,
            room_number: roomNumber,
            seats_available: seatsAvailable,
            total_seats: totalSeats,
          },
          { where: { id: courseId } }
        );
      }

      async deleteCourseRuntimes(courseId) {
        await CourseRuntime.destroy({ where: { course_id: courseId } });
      }

      
      

}


// EXPORTS
export default Database;