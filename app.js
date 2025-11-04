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

require('dotenv').config();
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
  } catch (err) {
    console.error('❌ Invalid FIREBASE_SERVICE_ACCOUNT JSON:', err);
  }
} else {
  // fallback for local development
  serviceAccount = require('./serviceAccount.json');
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
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
