const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
      }),
    });
  } catch (error) {
    console.error('❌ Firebase Init Error:', error.message);
  }
}

const db = admin.firestore();

exports.handler = async (event) => {
  // CORS Headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };

  // Handle browser preflight request
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  try {
    const { id } = JSON.parse(event.body);

    if (!id) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Post ID is required" }) };
    }

    await db.collection('blog_posts').doc(id).delete();

    return { 
      statusCode: 200, 
      headers, 
      body: JSON.stringify({ message: "Post deleted successfully", id }) 
    };
  } catch (error) {
    console.error('❌ Delete Post Error:', error);
    return { 
      statusCode: 500, 
      headers, 
      body: JSON.stringify({ error: "Failed to delete post", details: error.message }) 
    };
  }
};