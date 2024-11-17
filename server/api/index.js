// IMPORTS
import express from "express";

import authenticationRoutes from "./authenticationRoutes.js";
import courseRoutes from "./courseRoutes.js";
import studentRoutes from "./studentRoutes.js";
import availabilityRoutes from "./availabilityRoutes.js"


// CONSTANTS
const router = express.Router();


// ROUTES
router.use('/auth', authenticationRoutes);
router.use('/course', courseRoutes);
router.use('/student', studentRoutes);
router.use('/availability', availabilityRoutes);


// Student Routes



// EXPORTS
export default router;