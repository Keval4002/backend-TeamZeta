const admin = require('firebase-admin');
const User = require('../models/user.js'); // Make sure path is correct

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send({ error: 'Unauthorized: No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 1. VERIFY THE TOKEN WITH FIREBASE
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Destructure the properties from the token
    const { uid, email, name, phone_number } = decodedToken;

    // 2. FIND OR CREATE THE USER IN MONGODB
    // Try to find the user first
    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      // 3. CREATE NEW USER
      // If user doesn't exist, create them in your database
      console.log(`✨ Creating new user in DB for: ${email}`);
      
      const newUserDetails = {
        firebaseUid: uid,
        email: email,
        displayName: name || '', // Use 'name' from token, or default
        // Only add phone_number if it exists in the token
        ...(phone_number && { phone_number: phone_number }) 
      };

      user = new User(newUserDetails);
      await user.save();
    }

    // 4. ATTACH USER TO THE REQUEST
    // At this point, 'user' is either the one we found or the one we just created
    req.user = user; // `user` is your Mongoose User document
    next(); // Continue to the actual API route

  } catch (error) {
    // Handle errors (e.g., token expired, duplicate email/phone)
    console.error('Authentication error:', error);
    if (error.code === 'auth/id-token-expired') {
        return res.status(401).send({ error: 'Unauthorized: Token expired.' });
    }
    // Handle MongoDB duplicate key error (if email or phone is already in use)
    if (error.code === 11000) {
        return res.status(409).send({ error: 'Conflict: User with this email or phone number already exists.'});
    }
    return res.status(401).send({ error: 'Unauthorized: Invalid token.' });
  }
};

module.exports = authMiddleware;