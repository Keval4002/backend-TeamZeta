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
    console.log('🔐 Verifying Firebase token...');
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log('✅ Firebase token verified successfully');
    
    // Destructure the properties from the token
    const { uid, email, name, phone_number } = decodedToken;
    console.log(`👤 User details - UID: ${uid}, Email: ${email}`);

    // 2. FIND OR CREATE THE USER IN MONGODB
    // Try to find the user first
    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      // 3. CREATE NEW USER OR FIND EXISTING
      console.log(`✨ Creating new user in DB for: ${email}`);
      
      // First, try to find if user already exists by email (in case of previous errors)
      user = await User.findOne({ email: email });
      
      if (!user) {
        const newUserDetails = {
          firebaseUid: uid,
          email: email,
          displayName: name || '', // Use 'name' from token, or default
        };

        // Only add phone_number if it exists and is not null/undefined
        if (phone_number && phone_number.trim() !== '') {
          newUserDetails.phone_number = phone_number;
        }

        try {
          user = new User(newUserDetails);
          await user.save();
          console.log(`✅ Successfully created new user for: ${email}`);
        } catch (saveError) {
          console.log(`⚠️ User creation error for ${email}:`, saveError.message);
          
          if (saveError.code === 11000) {
            // Duplicate key error - try different approaches
            if (saveError.message.includes('phone_number')) {
              console.log(`🔍 Phone number conflict, trying without phone for: ${email}`);
              // Remove phone_number and try again
              delete newUserDetails.phone_number;
              try {
                user = new User(newUserDetails);
                await user.save();
                console.log(`✅ Created user without phone number for: ${email}`);
              } catch (secondError) {
                // Last resort: find by email
                user = await User.findOne({ email: email });
                if (!user) {
                  throw saveError;
                }
              }
            } else {
              // Email duplicate - find existing user
              user = await User.findOne({ email: email });
              if (!user) {
                throw saveError;
              }
            }
          } else {
            throw saveError;
          }
        }
      } else {
        console.log(`✅ Found existing user for: ${email}`);
      }
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