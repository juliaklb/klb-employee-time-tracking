import { integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  email: text("email").primaryKey(), name: text("name").notNull(),
  role: text("role", { enum: ["employee", "admin"] }).notNull().default("employee"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
export const timesheets = sqliteTable("timesheets", {
  id: integer("id").primaryKey({ autoIncrement: true }), employeeEmail: text("employee_email").notNull(),
  periodStart: text("period_start").notNull(), week: integer("week").notNull(),
  status: text("status", { enum: ["draft", "submitted", "approved", "returned"] }).notNull().default("draft"),
  submittedAt: integer("submitted_at", { mode: "timestamp" }), updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => [uniqueIndex("timesheet_employee_period_week").on(table.employeeEmail, table.periodStart, table.week)]);
export const timeEntries = sqliteTable("time_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }), timesheetId: integer("timesheet_id").notNull(),
  workDate: text("work_date").notNull(), status: text("status").notNull(), hours: real("hours").notNull().default(0),
  lieuUsed: real("lieu_used").notNull().default(0), lieuAccrued: real("lieu_accrued").notNull().default(0),
  travel: integer("travel", { mode: "boolean" }).notNull().default(false), notes: text("notes").notNull().default(""),
});
export const claims = sqliteTable("claims", {
  id: integer("id").primaryKey({ autoIncrement: true }), employeeEmail: text("employee_email").notNull(),
  claimType: text("claim_type", { enum: ["mileage", "expense"] }).notNull(), periodStart: text("period_start").notNull(),
  status: text("status", { enum: ["draft", "submitted", "approved", "returned"] }).notNull().default("draft"),
  purpose: text("purpose").notNull().default(""), payload: text("payload").notNull(), subtotal: real("subtotal").notNull().default(0),
  advance: real("advance").notNull().default(0), amountPayable: real("amount_payable").notNull().default(0),
  submittedAt: integer("submitted_at", { mode: "timestamp" }), updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
export const claimAttachments = sqliteTable("claim_attachments", {
  id: integer("id").primaryKey({ autoIncrement: true }), claimId: integer("claim_id").notNull(),
  objectKey: text("object_key").notNull(), fileName: text("file_name").notNull(), contentType: text("content_type").notNull(), size: integer("size").notNull(),
});
