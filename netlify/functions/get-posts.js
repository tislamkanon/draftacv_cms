const admin = require('firebase-admin');

// Initialize Firebase Admin using Environment Variables
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // This handles the newline formatting for the private key correctly
        privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
      })
    });
  } catch (error) {
    console.error('❌ Firebase Admin Initialization Error:', error.message);
  }
}

const db = admin.firestore();

exports.handler = async (event) => {
  // Define CORS headers to allow your GitHub site to talk to Netlify
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Content-Type": "application/json"
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    console.log('📡 Fetching posts from Firestore...');
    
    const snapshot = await db.collection('blog_posts')
      .orderBy('publish_date', 'desc')
      .get();

    const posts = [];
    snapshot.forEach(doc => {
      posts.push({ id: doc.id, ...doc.data() });
    });

    console.log(`✅ Successfully fetched ${posts.length} posts.`);

    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify(posts),
    };
  } catch (error) {
    console.error('❌ Firestore Fetch Error:', error);
    
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({ 
        error: "Failed to fetch posts", 
        details: error.message 
      }),
    };
  }
};