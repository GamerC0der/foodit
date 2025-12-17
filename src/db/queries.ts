import { db } from "./index"
import { wishes, places } from "./schema"
import { eq, desc, and } from "drizzle-orm"

export function listWishes(ipAddress: string) {
  return db.select().from(wishes).where(eq(wishes.ipAddress, ipAddress)).orderBy(desc(wishes.id)).all()
}

export function createWish(item: string, ipAddress: string) {
  const createdAt = Math.floor(Date.now() / 1000)

  const res = db.insert(wishes).values({
    item,
    fulfilled: 0,
    createdAt,
    ipAddress,
  }).run()

  return { id: Number(res.lastInsertRowid) }
}

export function fulfillWish(id: number, ipAddress: string) {
  const res = db.update(wishes)
    .set({ fulfilled: 1 })
    .where(and(eq(wishes.id, id), eq(wishes.ipAddress, ipAddress)))
    .run()

  return { changes: res.changes }
}

export function deleteWish(id: number, ipAddress: string) {
  const res = db.delete(wishes).where(and(eq(wishes.id, id), eq(wishes.ipAddress, ipAddress))).run()
  return { changes: res.changes }
}

export function listPlaces(ipAddress: string) {
  return db.select().from(places).where(eq(places.ipAddress, ipAddress)).orderBy(desc(places.id)).all()
}

export function createPlace(title: string, subtitle: string | null, type: string, query: string, thumbnail: string | null, latitude: number | null, longitude: number | null, placeId: string | null, ipAddress: string) {
  const createdAt = Math.floor(Date.now() / 1000)

  const res = db.insert(places).values({
    title,
    subtitle,
    type,
    query,
    thumbnail,
    latitude,
    longitude,
    placeId,
    createdAt,
    ipAddress,
  }).run()

  return { id: Number(res.lastInsertRowid) }
}

export function deletePlace(id: number, ipAddress: string) {
  const res = db.delete(places).where(and(eq(places.id, id), eq(places.ipAddress, ipAddress))).run()
  return { changes: res.changes }
}
