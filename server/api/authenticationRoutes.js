// IMPORTS
import express from "express";

import { isSignedIn, isVerified, isStudent, isFaculty, isAdmin } from "../config/authConfig.js";


// CONSTANTS
const authenticationRoutes = express.Router();


// ROUTES
authenticationRoutes.post('/login', async (req, res) => {
    const cognito = req.cognito;
    const { email, password } = req.body;
    try {
        const userId = await cognito.signIn(email, password)
        req.session.userId = userId;
        console.log(`This is after login path: ${JSON.stringify(req.session)}`)
        res.status(200).json({ "message": "User logged in successfully" });
        return;
    } catch (error) {
        res.status(400).json({ "error": error.message });
        return;
    }

});

authenticationRoutes.post('/register', isAdmin, async (req, res) => {
    const db = req.db;
    const cognito = req.cognito;
    const { email, role, dateOfBirth, firstName, lastName, phoneNumber } = req.body;
    // make a unique random password with 8 char, one uppercase, one lowercase, one number, one special character
    let password = "Aa1!" + Math.random().toString(36).slice(2, 10);
    try {
        const userId = await cognito.signUp(email, password).then(data => data.UserSub);
        db.createUser(userId, email, role, dateOfBirth, firstName, lastName, phoneNumber);
        req.session.userId = userId;
        res.status(200).json({ "message": "User created successfully" });
        return;
    } catch (error) {
        res.status(400).json({ "error": error.message });
        return;
    }
});

authenticationRoutes.post('/verify', async (req, res) => {
    const cognito = req.cognito;
    const { email, code } = req.body;
    try {
        await cognito.verify(email, code);
        res.status(200).json({ "message": "User verified successfully" });
        return;
    } catch (error) {
        res.status(400).json({ "error": error.message });
        return;
    }
});

authenticationRoutes.post('/logout', isSignedIn, async (req, res) => {
    req.session.destroy();
    res.status(200).json({ "message": "User logged out successfully" });
    return;
});

authenticationRoutes.post('/forgotPassword', async (req, res) => {
    const cognito = req.cognito;
    const { email } = req.body;
    try {
        await cognito.forgotPassword(email);
        res.status(200).json({ "message": "Password reset code sent successfully" });
        return;
    } catch (error) {
        res.status(400).json({ "error": error.message });
        return;
    }
});

authenticationRoutes.post('/resetPassword', async (req, res) => {
    const cognito = req.cognito;
    const { email, code, password } = req.body;
    try {
        await cognito.resetPassword(email, code, password);
        res.status(200).json({ "message": "Password reset successfully" });
        return;
    } catch (error) {
        res.status(400).json({ "error": error.message });
        return;
    }
});

authenticationRoutes.put('/completeVerification', async (req, res) => {
    const db = req.db;
    const { email } = req.body;
    try {
        const user = await db.getUser(email);
        if (user.is_verified === 1) {
            res.status(400).json({ "error": "User already verified" });
            return;
        }
        await db.verifyUser(user.id);
        req.session.userId = user.id;
        res.status(200).json({ "message": "User verified successfully" });
        return;
    } catch (error) {
        res.status(400).json({ "error": error.message });
        return;
    }
});

authenticationRoutes.get('/isSignedIn', isSignedIn, async (req, res) => {
    res.status(200).json({ "message": "User is signed in" });
    return;
});

authenticationRoutes.get('/isVerified', isSignedIn, isVerified, async (req, res) => {
    res.status(200).json({ "message": "User is verified" });
    return;
});

authenticationRoutes.get('/isStudent', isSignedIn, isStudent, async (req, res) => {
    res.status(200).json({ "message": "User is a student" });
    return;
});

authenticationRoutes.get('/isFaculty', isSignedIn, isFaculty, async (req, res) => {
    res.status(200).json({ "message": "User is a faculty member" });
    return;
});

authenticationRoutes.get('/isAdmin', isSignedIn, isAdmin, async (req, res) => {
    res.status(200).json({ "message": "User is an admin" });
    return;
});


// EXPORTS
export default authenticationRoutes;