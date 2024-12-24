const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE, 'base64').toString('utf-8'));
const projectId = process.env.PROJECT_ID;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: projectId,
});

module.exports = admin;