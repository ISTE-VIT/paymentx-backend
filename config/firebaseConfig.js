const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();


const serviceAccount = require(process.env.FIREBASE_PATH);
const projectId = process.env.PROJECT_ID;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: projectId,
});

module.exports = admin;