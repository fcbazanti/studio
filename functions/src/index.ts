import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();

export const notifyUpcoming = onSchedule("every 1 minutes", async () => {
  const now = new Date();
  const in5min = new Date(now.getTime() + 5 * 60 * 1000);

  const eventsSnap = await db
    .collection("events")
    .where("startTime", ">", now)
    .where("startTime", "<=", in5min)
    .get();

  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const todosSnap = await db
    .collection("todos")
    .where("dueDate", ">=", startOfDay)
    .where("dueDate", "<", endOfDay)
    .get();

  const tasks = [...eventsSnap.docs, ...todosSnap.docs];
  const sendPromises = tasks.map(async (doc) => {
    const data = doc.data();
    const userId = data.userId;
    if (!userId) return;

    const userDoc = await db.collection("users").doc(userId).get();
    const token = userDoc.data()?.fcmToken;
    if (!token) return;

    return messaging.send({
      token,
      notification: {
        title: "Připomenutí 📅",
        body: data.title || "Máš naplánovaný úkol nebo událost dnes!",
      },
    });
  });

  await Promise.all(sendPromises);
  console.log("Notifikace odeslány.");
});
