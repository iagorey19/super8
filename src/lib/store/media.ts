import type { Notification, Photo } from "../types"
import { getData, saveData } from "./core"

// --- Notifications ---

export async function createNotification(userId: string, type: Notification["type"], title: string, message: string): Promise<Notification> {
  const data = getData()
  const notification: Notification = {
    id: crypto.randomUUID(), user_id: userId, type, title, message,
    read: false, created_at: new Date().toISOString(),
  }
  data.notifications.push(notification)
  await saveData(data)
  return notification
}

export function getNotifications(userId: string): Notification[] {
  const data = getData()
  return data.notifications
    .filter((n) => n.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export async function markNotificationRead(notificationId: string) {
  const data = getData()
  const notif = data.notifications.find((n) => n.id === notificationId)
  if (notif) {
    notif.read = true
    await saveData(data)
  }
}

export function getUnreadCount(userId: string): number {
  const data = getData()
  return data.notifications.filter((n) => n.user_id === userId && !n.read).length
}

export async function markAllNotificationsRead(userId: string) {
  const data = getData()
  let changed = false
  for (const n of data.notifications) {
    if (n.user_id === userId && !n.read) {
      n.read = true; changed = true
    }
  }
  if (changed) await saveData(data)
}

export async function deleteNotification(notificationId: string) {
  const data = getData()
  const idx = data.notifications.findIndex((n) => n.id === notificationId)
  if (idx !== -1) {
    data.notifications.splice(idx, 1)
    await saveData(data)
  }
}

export async function deleteAllNotifications(userId: string) {
  const data = getData()
  data.notifications = data.notifications.filter((n) => n.user_id !== userId)
  await saveData(data)
}

// --- Photos ---

export async function createPhoto(url: string, caption: string | undefined, uploadedBy: string, tournamentId?: string): Promise<Photo> {
  const data = getData()
  const photo: Photo = {
    id: crypto.randomUUID(), ...(tournamentId ? { tournament_id: tournamentId } : {}),
    url, caption, uploaded_by: uploadedBy, created_at: new Date().toISOString(),
  }
  data.photos.push(photo)
  await saveData(data)
  return photo
}

export async function deletePhoto(photoId: string) {
  const data = getData()
  data.photos = data.photos.filter((p) => p.id !== photoId)
  await saveData(data)
}

export function getPhotos(tournamentId?: string): Photo[] {
  const data = getData()
  let result = data.photos
  if (tournamentId) result = result.filter((p) => p.tournament_id === tournamentId)
  return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}
