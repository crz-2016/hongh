import { pgTable, serial, timestamp, index, unique, pgPolicy, varchar } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	password: varchar({ length: 255 }).notNull(),
	username: varchar({ length: 50 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("users_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	unique("users_email_unique").on(table.email),
	pgPolicy("Users can update own profile", { as: "permissive", for: "update", to: ["resume"], using: sql`true` }),
	pgPolicy("Users can insert own profile", { as: "permissive", for: "insert", to: ["resume"] }),
	pgPolicy("Users can view own profile", { as: "permissive", for: "select", to: ["resume"] }),
]);

