import admin from "firebase-admin";

// Inicializace Firebase Admin SDK
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export async function GET() {
  try {
    const db = admin.firestore();
    const now = new Date();
    const fiveMinutesLater = new Date(now.getTime() + 5 * 60 * 1000);

    const eventsRef = db.collection("events");
    const todosRef = db.collection("todos");

    // Události začínající za 5 minut
    const upcomingEvents = await eventsRef
      .where("start", "<=", fiveMinutesLater)
      .where("start", ">", now)
      .get();

    // Úkoly s dnešním datem
    const todayTodos = await todosRef
      .where("dueDate", "==", now.toISOString().split("T")[0])
      .get();

    let notifications = [];

    upcomingEvents.forEach((doc) => {
      notifications.push(`Událost za 5 minut: ${doc.data().title}`);
    });

    todayTodos.forEach((doc) => {
      notifications.push(`Úkol na dnešek: ${doc.data().title}`);
    });

    return Response.json({ success: true, count: notifications.length, notifications });
  } catch (error) {
    console.error("Chyba při odesílání notifikací:", error);
    return Response.json({ success: false, error: error.message });
  }
}
