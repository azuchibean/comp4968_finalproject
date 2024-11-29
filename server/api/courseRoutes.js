// IMPORTS
import express from "express";

import { isSignedIn, isVerified, isStudent, isFaculty, isAdmin } from "../config/authConfig.js";


// CONSTANTS
const courseRoutes = express.Router();


// ROUTES
courseRoutes.get('/getAllCourses', isSignedIn, isVerified, async (req, res) => {
    const db = req.db;
    try {
        const courses = await db.getAllCourses();
        res.status(200).json({ "courses": courses });
        return;
    } catch (error) {
        res.status(400).json({ "error": error.message });
        return;
    }
})

// Create new course
courseRoutes.post('/createCourse', isSignedIn, isVerified, isAdmin, async (req, res) => {
    const db = req.db;
    const { faculty_id, course_name, course_description, room_number, seats_available, total_seats, date_available} = req.body;
    try {
        const courseId = await db.createCourse(faculty_id, course_name, course_description, room_number, seats_available, total_seats, date_available);
        res.status(200).json({ "message": "Course created successfully", courseId });
        return;
    } catch (error) {
        res.status(400).json({ "error": error.message });
        return;
    }
})

// Delete course by ID
courseRoutes.delete('/deleteCourse/:courseId', isSignedIn, isVerified, isAdmin, async (req, res) => {
    const courseId = req.params.courseId;
    const db = req.db;
    try {
        await db.deleteCourse(courseId);
        res.status(200).json({ "message": "Course deleted successfully" });
        return;
    } catch (error) {
        res.status(400).json({ "error": error.message });
        return;
    }
})

courseRoutes.put('/createCourseRuntime/:courseId', isSignedIn, isVerified, isAdmin, async (req, res) => {
    const courseId = req.params.courseId;
    const db = req.db;
    const { start_date, end_date, start_time, end_time, day_of_week, location } = req.body;
    try {
        await db.createCourseRuntime(courseId, start_date, end_date, start_time, end_time, day_of_week, location);
        res.status(200).json({ "message": "Course runtime created successfully" });
        return;
    } catch (error) {
        res.status(400).json({ "error": error.message });
        return;
    }
});

// Get course details including runtimes (for editing)
courseRoutes.get("/:courseId", isSignedIn, isVerified, isAdmin, async (req, res) => {
    const { courseId } = req.params;
    const db = req.db;

    try {
        const course = await db.getCourseById(courseId);
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }

        const runtimes = await db.getCourseRuntimesByCourseId(courseId);

        res.status(200).json({ course, runtimes });
    } catch (error) {
        console.error("Error fetching course details:", error);
        res.status(500).json({ error: "Failed to fetch course details" });
    }
});

// Update course by ID
courseRoutes.put("/updateCourse/:courseId", isSignedIn, isVerified, isAdmin, async (req, res) => {
    const { courseId } = req.params;
    const { faculty_id, course_name, course_description, room_number, seats_available, total_seats } = req.body;
    const db = req.db;

    try {
        await db.updateCourse(courseId, faculty_id, course_name, course_description, room_number, seats_available, total_seats);
        res.status(200).json({ message: "Course updated successfully" });
    } catch (error) {
        console.error("Error updating course:", error);
        res.status(500).json({ error: "Failed to update course" });
    }
});

// Update course runtimes
courseRoutes.put("/updateCourseRuntimes/:courseId", isSignedIn, isVerified, isAdmin, async (req, res) => {
    const { courseId } = req.params;
    const { runtimes } = req.body; // Array of runtime objects
    const db = req.db;

    try {
        // Delete existing runtimes
        await db.deleteCourseRuntimes(courseId);

        // Add new runtimes
        for (const runtime of runtimes) {
            await db.createCourseRuntime(
                courseId,
                runtime.start_date,
                runtime.end_date,
                runtime.day_of_week,
                runtime.start_time,
                runtime.end_time,
                runtime.location
            );
        }

        res.status(200).json({ message: "Course runtimes updated successfully" });
    } catch (error) {
        console.error("Error updating course runtimes:", error);
        res.status(500).json({ error: "Failed to update course runtimes" });
    }
});

// EXPORTS
export default courseRoutes;