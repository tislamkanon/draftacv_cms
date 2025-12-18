const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

exports.handler = async (event) => {
  // CORS Headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: "Method Not Allowed" };

  try {
    const { id, ...postData } = JSON.parse(event.body);
    
    if (id) {
      // Update existing
      await db.collection('blog_posts').doc(id).set(postData, { merge: true });
      return { statusCode: 200, headers, body: JSON.stringify({ message: "Updated", id }) };
    } else {
      // Create new
      const docRef = await db.collection('blog_posts').add({
        ...postData,
        created_at: admin.firestore.FieldValue.serverTimestamp()
      });
      return { statusCode: 201, headers, body: JSON.stringify({ message: "Created", id: docRef.id }) };
    }
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
