// IMPORTS
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from 'cors'
import bodyParser from "body-parser"
import coursesRouter from './api/courses.js';
import AWS from "aws-sdk"; // Use import for aws-sdk




// CONSTANTS
const PORT = process.env.PORT || 5000;
const app = express();


// AWS CONFIG
let awsConfig = {
    "region": "us-west-2",
    "accessKeyId": process.env.AWS_ACCESS_KEY,
    "secretAccessKey": process.env.AWS_SECRET_KEY
};

AWS.config.update(awsConfig);

// Create a new SES object
const ses = new AWS.SES({ apiVersion: "2010-12-01" });

// Create a new CognitoIdentityServiceProvider object
const cognito = new AWS.CognitoIdentityServiceProvider();

// MIDDLEWARE
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use((req, res, next) => {
    console.log(`[${req.method} Request]\t${req.url}\nDate: ${new Date()}\nParams: ${JSON.stringify(req.query, null, 2)}\nBody: ${JSON.stringify(req.body, null, 2)}\n------------------`)
    next()
})
app.use('/api', coursesRouter);


// ROUTES
app.get('/', async (req, res) => {
    res.status(200).send("Hello World!")
});


// signup route
app.post('/signup', async (req, res) => {
    const {  password, email, dob, firstName, lastName, phoneNo } = req.body;
  
    // Generate a unique student ID starting with 'A' followed by random digits
    const studentId = 'A' + Math.floor(Math.random() * 100000000).toString(); // 'A' followed by an 8-digit random number

  
    const params = {
      ClientId: process.env.COGNITO_CLIENT_ID, // Your Cognito app client ID
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'custom:DOB', Value: dob },
        { Name: 'custom:FirstName', Value: firstName },
        { Name: 'custom:LastName', Value: lastName },
        { Name: 'custom:PhoneNo', Value: phoneNo },
        { Name: 'custom:StudentId', Value: studentId },
        { Name: 'custom:UserType', Value: '0' } // Setting default userType to '0'
      ]
    };
  
    try {
      // Sign up the user
      const data = await cognito.signUp(params).promise();
  
      console.log('User signed up successfully:', data);
  
      res.status(200).json({ success: true, message: 'User signed up successfully', studentId });
    } catch (error) {
      console.error('Error signing up user:', error);
      res.status(500).json({ success: false, error: 'Error signing up user: ' + error.message });
    }
  });

// verification of email route

app.post('/verify', async (req, res) => {
    const { email, verificationCode } = req.body;

    const params = {
        ClientId: process.env.COGNITO_CLIENT_ID, // Your Cognito app client ID
        Username: email,
        ConfirmationCode: verificationCode
    };

    try {
        // Confirm user's email address
        await cognito.confirmSignUp(params).promise();

        console.log('User email confirmed successfully');

        res.status(200).json({ success: true, message: 'Email confirmed successfully. You can now log in.' });

    
    } catch (error) {
        console.error('Error confirming email:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});


app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const params = {
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: process.env.COGNITO_CLIENT_ID,
        AuthParameters: {
            USERNAME: email,
            PASSWORD: password,
        },
    };

    try {
        const data = await cognito.initiateAuth(params).promise();
        console.log("Login successful:", data);
        res.status(200).json({
            success: true,
            message: "Login successful",
            // token: data.AuthenticationResult.IdToken,  // If successful, send the ID token
        });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(400).json({ success: false, message: error.message });
    }
});


// LISTEN
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
