import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member"
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
)
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema({
  // default auth tables using convex auth.
  ...authTables, // do not remove or modify

  // the users table is the default users table that is brought in by the authTables
  users: defineTable({
    name: v.optional(v.string()), // name of the user. do not remove
    image: v.optional(v.string()), // image of the user. do not remove
    email: v.optional(v.string()), // email of the user. do not remove
    emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
    isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove
    
    role: v.optional(roleValidator), // role of the user. do not remove
  })
    .index("email", ["email"]), // Added comma here

  courses: defineTable({
    name: v.string(),
    description: v.string(),
    teacherId: v.id("users"),
    students: v.array(v.id("users")),
  })
    .index("by_teacher", ["teacherId"])
    .index("by_student", ["students"]),

  assignments: defineTable({
    title: v.string(),
    description: v.string(),
    dueDate: v.number(),
    courseId: v.id("courses"),
  })
    .index("by_course", ["courseId"]),

  grades: defineTable({
    studentId: v.id("users"),
    assignmentId: v.id("assignments"),
    courseId: v.id("courses"),
    score: v.number(),
  })
    .index("by_student", ["studentId"])
    .index("by_course", ["courseId"])
    .index("by_assignment", ["assignmentId"]),

  attendance: defineTable({
    studentId: v.id("users"),
    courseId: v.id("courses"),
    date: v.number(),
    present: v.boolean(),
  })
    .index("by_student", ["studentId"])
    .index("by_course", ["courseId"])
    .index("by_date", ["date"]),

  announcements: defineTable({
    title: v.string(),
    content: v.string(),
    teacherId: v.id("users"),
    courseId: v.optional(v.id("courses")), // Optional to allow school-wide announcements
    date: v.number(),
  })
    .index("by_teacher", ["teacherId"])
    .index("by_course", ["courseId"])
    .index("by_date", ["date"]),
},
{
  schemaValidation: false
});

export default schema;