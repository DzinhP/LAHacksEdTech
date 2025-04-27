import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// Default user roles
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

// Define the schema
const schema = defineSchema({
  ...authTables, // DO NOT remove auth tables

  // Users Table
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    role: v.optional(roleValidator),
  }).index("email", ["email"]),

  // Courses Table
  courses: defineTable({
    name: v.string(),
    description: v.string(),
    teacherId: v.id("users"),
    students: v.array(v.id("users")),
  })
    .index("by_teacher", ["teacherId"])
    .index("by_student", ["students"]),

  // Assignments Table
  assignments: defineTable({
    title: v.string(),
    description: v.string(),
    dueDate: v.number(),
    courseId: v.id("courses"),
  }).index("by_course", ["courseId"]),

  // Grades Table
  grades: defineTable({
    studentId: v.id("users"),
    assignmentId: v.id("assignments"),
    courseId: v.id("courses"),
    score: v.number(),
  })
    .index("by_student", ["studentId"])
    .index("by_course", ["courseId"])
    .index("by_assignment", ["assignmentId"]),

  // Attendance Table
  attendance: defineTable({
    studentId: v.id("users"),
    courseId: v.id("courses"),
    date: v.number(),
    present: v.boolean(),
  })
    .index("by_student", ["studentId"])
    .index("by_course", ["courseId"])
    .index("by_date", ["date"]),

  // Announcements Table
  announcements: defineTable({
    title: v.string(),
    content: v.string(),
    teacherId: v.id("users"),
    courseId: v.optional(v.id("courses")),
    date: v.number(),
  })
    .index("by_teacher", ["teacherId"])
    .index("by_course", ["courseId"])
    .index("by_date", ["date"]),

  // 🔥 Special Education: Students Table
  students: defineTable({
    name: v.string(),
    dob: v.string(),
    grade: v.string(),
  }).index("by_name", ["name"]),

  // 🔥 Special Education: IEP Drafts Table
  iepDrafts: defineTable({
    studentId: v.id("students"),
    status: v.string(), // "draft", "signed", etc.
    plafp: v.optional(v.string()), // Present levels
    goals: v.optional(v.array(v.string())), // Goal texts
    services: v.optional(v.array(v.string())), // Therapy services
    accommodations: v.optional(v.array(v.string())), // Testing accommodations
    timestamps: v.optional(v.any()), // Important dates
  }).index("by_student", ["studentId"]),

  // 🔥 Special Education: Service Logs Table
  serviceLogs: defineTable({
    studentId: v.id("students"),
    serviceType: v.string(), // e.g., "speech therapy"
    minutesScheduled: v.number(),
    minutesDelivered: v.number(),
    date: v.string(), // ISO date
  }).index("by_student_date", ["studentId", "date"]),

  // 🔥 Special Education: Goals Table
  goals: defineTable({
    studentId: v.id("students"),
    description: v.string(), // SMART goal text
    createdAt: v.string(), // ISO datetime
  }).index("by_student", ["studentId"]),
},
{
  schemaValidation: false,
});

export default schema;
