// IMPORTS
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from 'cors'
import bodyParser from "body-parser";
import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { SESClient } from "@aws-sdk/client-ses";

import Database from "./services/database.js";
import Cognito from "./services/Cognito.js";

import config from "./models/index.js";
import createSessionConfig from "./config/sessionConfig.js";
import router from "./api/index.js";


// CONSTANTS
const PORT = process.env.PORT || 5001;
const app = express();
const { dbConfig, syncDatabase } = config;
const sessionConfig = createSessionConfig(dbConfig);


// SYNC DATABASE
syncDatabase();


// AWS CONFIG
const cognitoClient = new CognitoIdentityProviderClient({
    region: "us-west-2",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
    }
});
const sesClient = new SESClient({
    region: "us-west-2",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
    }
});


// SERVICES
const db = new Database(dbConfig);
const cognito = new Cognito(cognitoClient);


// MIDDLEWARE
const corsOptions = {
    origin: process.env.CLIENT_URL,
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(sessionConfig);
app.use((req, res, next) => {
    req.db = db;
    req.cognito = cognito;
    next();
});
app.use((req, res, next) => {
    console.log(`[${req.method} Request]\t${req.url}\nDate: ${new Date()}\nParams: ${JSON.stringify(req.query, null, 2)}\nBody: ${JSON.stringify(req.body, null, 2)}\n------------------`)
    next()
})


// ROUTES
app.get('/', async (req, res) => {
    res.status(200).send("Hello World!")
});

app.use('/api', router);


app.get('/set-session', (req, res) => {
    req.session.userId = 12345; // Storing userId in session
    res.send('Session data saved!');
});

app.get('/get-session', (req, res) => {
    res.send({ sessionData: req.session }); // Retrieving session data
});


// LISTEN
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
