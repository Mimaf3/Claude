import webpush from "web-push";
import { prisma } from "./prisma";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || "mailto:contact@medilink.fr",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function sendPushToUser(
  userId: string,
  payload: { title: string; body: string; url?: string }
) {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload)
      );
    } catch {
      await prisma.pushSubscription.delete({ where: { id: sub.id } });
    }
  }
}

export async function sendPushToUsersForVacation(
  vacationId: string,
  siteId: string,
  requiredRole: string,
  payload: { title: string; body: string; url?: string }
) {
  const users = await prisma.user.findMany({
    where: {
      role: requiredRole,
      isActive: true,
      sitePreferences: {
        some: { siteId, enabled: true },
      },
      pushSubscriptions: { some: {} },
    },
    include: { pushSubscriptions: true },
  });

  for (const user of users) {
    for (const sub of user.pushSubscriptions) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload)
        );
      } catch {
        await prisma.pushSubscription.delete({ where: { id: sub.id } });
      }
    }
  }
}
