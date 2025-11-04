// //imports
// require('dotenv').config();
// const express = require('express');
// const cors = require('cors')
// const app = express()
// const connectDB = require('./db/connect')
// const admin = require('firebase-admin')
// const serviceAccount = require('./serviceAccount.json')

// //routers
// const authRouter  = require('./routes/authRouter')
// const transactionsRouter = require('./routes/transactionRouter')
// const aiRouter = require('./routes/aiRouter') // <-- 1. IMPORT NEW ROUTER

// // Initialize Firebase Admin (do this ONCE in your main index.js/server.js)
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

// //middleware
// app.use(express.json())
// app.use(cors());


// // //routes
// // app.use('/app/v1/auth',authRouter)
// app.use('/api/transactions',transactionsRouter)
// app.use('/api', aiRouter) // <-- 2. USE NEW ROUTER

// //server
// const port = 3000;
// const start = async()=>{
//     try {
//         await connectDB(process.env.MONGO_URI)
//         app.listen(port, console.log(`App has started on port ${port}`));
//     } catch (error) {
//         console.log(error)
//     }
// }
// start();

// backend/app.js

require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const app = express();
const connectDB = require('./db/connect');
const admin = require('firebase-admin');

// Routers
const authRouter = require('./routes/authRouter');
const transactionsRouter = require('./routes/transactionRouter');
const aiRouter = require('./routes/aiRouter');

// Middleware
app.use(express.json());
app.use(cors());

// --- 🔥 Firebase Admin Initialization ---
let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    // Parse the service account JSON from the environment variable
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log('✅ Firebase service account loaded from environment variables');
    console.log('📋 Project ID:', serviceAccount.project_id);
    console.log('📋 Client Email:', serviceAccount.client_email);
  } catch (err) {
    console.error('❌ Invalid FIREBASE_SERVICE_ACCOUNT JSON:', err);
    console.log('🔍 Falling back to serviceAccount.json file');
    serviceAccount = require('./serviceAccount.json');
  }
} else {
  console.log('⚠️ No FIREBASE_SERVICE_ACCOUNT env var found, using serviceAccount.json');
  serviceAccount = require('./serviceAccount.json');
}

// Validate service account before initializing
if (!serviceAccount || !serviceAccount.project_id || !serviceAccount.private_key) {
  console.error('❌ Invalid service account configuration');
  process.exit(1);
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (firebaseError) {
    console.error('❌ Firebase Admin SDK initialization failed:', firebaseError);
    process.exit(1);
  }
}

// --- Routes ---
app.use('/api/auth', authRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/ai', aiRouter);

// --- Server ---
const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => console.log(`✅ App running on port ${port}`));
  } catch (error) {
    console.error('❌ Error starting server:', error);
  }
};

start();

module.exports = app;
