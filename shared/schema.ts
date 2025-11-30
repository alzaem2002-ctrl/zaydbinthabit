import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table - Required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - Required for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { length: 50 }).default("teacher"), // creator, admin, supervisor, teacher
  educationalLevel: varchar("educational_level", { length: 50 }).default("معلم"), // معلم, معلم ممارس, معلم متقدم, معلم خبير
  schoolName: varchar("school_name"),
  educationDepartment: varchar("education_department"),
  subject: varchar("subject"),
  principalName: varchar("principal_name"),
  yearsOfService: integer("years_of_service"),
  contactEmail: varchar("contact_email"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Professional Indicators - المؤشرات المهنية
export const indicators = pgTable("indicators", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).default("pending"), // pending, in_progress, completed
  witnessCount: integer("witness_count").default(0),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Criteria - المعايير
export const criteria = pgTable("criteria", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  indicatorId: varchar("indicator_id").references(() => indicators.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  isCompleted: boolean("is_completed").default(false),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Witnesses - الشواهد
export const witnesses = pgTable("witnesses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  indicatorId: varchar("indicator_id").references(() => indicators.id, { onDelete: "cascade" }),
  criteriaId: varchar("criteria_id").references(() => criteria.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  fileUrl: varchar("file_url"),
  fileType: varchar("file_type", { length: 50 }), // pdf, image, video, document
  fileName: varchar("file_name"),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Strategies - الاستراتيجيات
export const strategies = pgTable("strategies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Selected Strategies - الاستراتيجيات المختارة
export const userStrategies = pgTable("user_strategies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  strategyId: varchar("strategy_id").references(() => strategies.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Capabilities - القدرات
export const capabilities = pgTable("capabilities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Changes - التغييرات
export const changes = pgTable("changes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Signatures - التوقيعات والاعتماد
export const signatures = pgTable("signatures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  indicatorId: varchar("indicator_id").references(() => indicators.id, { onDelete: "cascade" }),
  teacherId: varchar("teacher_id").references(() => users.id, { onDelete: "cascade" }),
  principalId: varchar("principal_id").references(() => users.id, { onDelete: "set null" }),
  status: varchar("status", { length: 20 }).default("pending"), // pending, approved, rejected
  notes: text("notes"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  signedAt: timestamp("signed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  indicators: many(indicators),
  witnesses: many(witnesses),
  userStrategies: many(userStrategies),
  submittedSignatures: many(signatures, { relationName: "teacherSignatures" }),
  approvedSignatures: many(signatures, { relationName: "principalSignatures" }),
}));

export const indicatorsRelations = relations(indicators, ({ one, many }) => ({
  user: one(users, {
    fields: [indicators.userId],
    references: [users.id],
  }),
  criteria: many(criteria),
  witnesses: many(witnesses),
  signatures: many(signatures),
}));

export const criteriaRelations = relations(criteria, ({ one, many }) => ({
  indicator: one(indicators, {
    fields: [criteria.indicatorId],
    references: [indicators.id],
  }),
  witnesses: many(witnesses),
}));

export const witnessesRelations = relations(witnesses, ({ one }) => ({
  indicator: one(indicators, {
    fields: [witnesses.indicatorId],
    references: [indicators.id],
  }),
  criteria: one(criteria, {
    fields: [witnesses.criteriaId],
    references: [criteria.id],
  }),
  user: one(users, {
    fields: [witnesses.userId],
    references: [users.id],
  }),
}));

export const strategiesRelations = relations(strategies, ({ many }) => ({
  userStrategies: many(userStrategies),
}));

export const userStrategiesRelations = relations(userStrategies, ({ one }) => ({
  user: one(users, {
    fields: [userStrategies.userId],
    references: [users.id],
  }),
  strategy: one(strategies, {
    fields: [userStrategies.strategyId],
    references: [strategies.id],
  }),
}));

export const signaturesRelations = relations(signatures, ({ one }) => ({
  indicator: one(indicators, {
    fields: [signatures.indicatorId],
    references: [indicators.id],
  }),
  teacher: one(users, {
    fields: [signatures.teacherId],
    references: [users.id],
    relationName: "teacherSignatures",
  }),
  principal: one(users, {
    fields: [signatures.principalId],
    references: [users.id],
    relationName: "principalSignatures",
  }),
}));

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertIndicatorSchema = createInsertSchema(indicators).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCriteriaSchema = createInsertSchema(criteria).omit({
  id: true,
  createdAt: true,
});

export const insertWitnessSchema = createInsertSchema(witnesses).omit({
  id: true,
  createdAt: true,
});

export const insertStrategySchema = createInsertSchema(strategies).omit({
  id: true,
  createdAt: true,
});

export const insertUserStrategySchema = createInsertSchema(userStrategies).omit({
  id: true,
  createdAt: true,
});

export const insertCapabilitySchema = createInsertSchema(capabilities).omit({
  id: true,
  createdAt: true,
});

export const insertChangeSchema = createInsertSchema(changes).omit({
  id: true,
  createdAt: true,
});

export const insertSignatureSchema = createInsertSchema(signatures).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Indicator = typeof indicators.$inferSelect;
export type InsertIndicator = z.infer<typeof insertIndicatorSchema>;

export type Criteria = typeof criteria.$inferSelect;
export type InsertCriteria = z.infer<typeof insertCriteriaSchema>;

export type Witness = typeof witnesses.$inferSelect;
export type InsertWitness = z.infer<typeof insertWitnessSchema>;

export type Strategy = typeof strategies.$inferSelect;
export type InsertStrategy = z.infer<typeof insertStrategySchema>;

export type UserStrategy = typeof userStrategies.$inferSelect;
export type InsertUserStrategy = z.infer<typeof insertUserStrategySchema>;

export type Capability = typeof capabilities.$inferSelect;
export type InsertCapability = z.infer<typeof insertCapabilitySchema>;

export type Change = typeof changes.$inferSelect;
export type InsertChange = z.infer<typeof insertChangeSchema>;

export type Signature = typeof signatures.$inferSelect;
export type InsertSignature = z.infer<typeof insertSignatureSchema>;

// Extended types for frontend
export type IndicatorWithCriteria = Indicator & {
  criteria: Criteria[];
  witnesses?: Witness[];
};

export type StrategyWithSelection = Strategy & {
  isSelected: boolean;
};

export type DashboardStats = {
  totalCapabilities: number;
  totalChanges: number;
  totalIndicators: number;
  completedIndicators: number;
  pendingIndicators: number;
  inProgressIndicators: number;
  totalWitnesses: number;
};

// Extended signature type with user and indicator details
export type SignatureWithDetails = Signature & {
  teacher?: User;
  principal?: User;
  indicator?: IndicatorWithCriteria;
};

// Principal dashboard stats
export type PrincipalDashboardStats = DashboardStats & {
  totalTeachers: number;
  pendingApprovals: number;
  approvedIndicators: number;
  rejectedIndicators: number;
};

// Teacher info for principal view
export type TeacherWithStats = User & {
  indicatorCount: number;
  completedCount: number;
  pendingApprovalCount: number;
};
