import { pgTable, text, numeric, timestamp, integer, uuid, jsonb, date } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const userRoles = pgTable("user_roles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => adminUsers.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("admin"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adminUsers = pgTable("admin_users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const members = pgTable("members", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  category: text("category").notNull(),
  institution: text("institution"),
  course: text("course"),
  yearOfStudy: text("year_of_study"),
  studentNumber: text("student_number"),
  county: text("county"),
  subCounty: text("sub_county"),
  dateOfBirth: date("date_of_birth"),
  gender: text("gender"),
  nextOfKinName: text("next_of_kin_name"),
  nextOfKinPhone: text("next_of_kin_phone"),
  skills: text("skills"),
  status: text("status").notNull().default("Pending Payment"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const announcements = pgTable("announcements", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const leaders = pgTable("leaders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  role: text("role").notNull(),
  phone: text("phone"),
  photoUrl: text("photo_url"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const welfareCampaigns = pgTable("welfare_campaigns", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  beneficiary: text("beneficiary"),
  goalAmount: numeric("goal_amount").notNull().default("0"),
  raisedAmount: numeric("raised_amount").notNull().default("0"),
  status: text("status").notNull().default("active"),
  coverImageUrl: text("cover_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  purpose: text("purpose").notNull(),
  memberId: uuid("member_id").references(() => members.id, { onDelete: "set null" }),
  campaignId: uuid("campaign_id").references(() => welfareCampaigns.id, { onDelete: "set null" }),
  payerName: text("payer_name").notNull(),
  payerPhone: text("payer_phone").notNull(),
  payerEmail: text("payer_email"),
  amount: numeric("amount").notNull(),
  currency: text("currency").notNull().default("KES"),
  merchantReference: text("merchant_reference").notNull().unique(),
  pesapalTrackingId: text("pesapal_tracking_id"),
  pesapalRedirectUrl: text("pesapal_redirect_url"),
  status: text("status").notNull().default("PENDING"),
  rawCallback: jsonb("raw_callback"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
