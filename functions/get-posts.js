// netlify/functions/get-posts.js
const admin = require('firebase-admin');

// 1. Initialize Firebase Admin using Environment Variables
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // This handles the newline formatting for the private key
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    })
  });
}

const db = admin.firestore();

exports.handler = async (event) => {
  try {
    // 2. Fetch data from Firestore securely on the server
    const snapshot = await db.collection('blog_posts')
      .orderBy('publish_date', 'desc')
      .get();

    const posts = [];
    snapshot.forEach(doc => {
      posts.push({ id: doc.id, ...doc.data() });
    });

    // 3. Return the data to your website
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Allows your public site to call this
        "Content-Type": "application/json"
      },
      body: JSON.stringify(posts),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
