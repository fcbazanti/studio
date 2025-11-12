import { NextResponse } from "next/server";
import admin from "firebase-admin";

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const messaging = admin.messaging();

export async function GET() {
  const now = new Date();
  const in5min = new Date(now.getTime() + 5 * 60 * 1000);

  // Eventy do 5 minut
  const eventsSnap = await db
    .collection("events")
    .where("startTime", ">", now)
    .where("startTime", "<=", in5min)
    .get();

  // Úkoly dne
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const todosSnap = await db
    .collection("todos")
    .where("dueDate", ">=", startOfDay)
    .where("dueDate", "<", endOfDay)
    .get();

  const docs = [...eventsSnap.docs, ...todosSnap.docs];
  const promises = docs.map(async (doc) => {
    const data = doc.data();
    const userId = data.userId;
    if (!userId) return;

    const user = await db.collection("users").doc(userId).get();
    const token = user.data()?.fcmToken;
    if (!token) return;

    await messaging.send({
      token,
      notification: {
        title: "Připomenutí 📅",
        body: data.title || "Máš naplánovaný úkol nebo událost dnes!",
      },
    });
  });

  await Promise.all(promises);
  return NextResponse.json({ success: true, count: docs.length });
}
