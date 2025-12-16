import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core"

export const wishes = sqliteTable("wishes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  item: text("item").notNull(),
  fulfilled: integer("fulfilled").notNull().default(0),
  createdAt: integer("created_at").notNull(),
})

export const places = sqliteTable("places", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  type: text("type").notNull(),
  query: text("query").notNull(),
  thumbnail: text("thumbnail"),
  createdAt: integer("created_at").notNull(),
})
