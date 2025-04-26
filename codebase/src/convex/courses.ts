import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { getCurrentUser } from "./users";

// List all courses for the current teacher
export const listTeacherCourses = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const courses = await ctx.db
      .query("courses")
      .withIndex("by_teacher", (q) => q.eq("teacherId", user._id))
      .collect();

    return courses;
  },
});

// Get details of a specific course including enrolled students
export const getCourseDetails = query({
  args: {
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    // Check if user is the teacher of this course
    if (course.teacherId !== user._id) {
      throw new Error("Not authorized to view this course");
    }

    // Get enrolled students' details
    const students = await Promise.all(
      course.students.map(async (studentId) => {
        const student = await ctx.db.get(studentId);
        return student;
      })
    );

    return {
      ...course,
      students: students.filter((s): s is NonNullable<typeof s> => s !== null),
    };
  },
});

// List assignments for a course
export const listCourseAssignments = query({
  args: {
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    // Check if user is the teacher of this course
    if (course.teacherId !== user._id) {
      throw new Error("Not authorized to view this course");
    }

    const assignments = await ctx.db
      .query("assignments")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    return assignments;
  },
});

// Create a new course
export const createCourse = mutation({
  args: {
    name: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const courseId = await ctx.db.insert("courses", {
      name: args.name,
      description: args.description,
      teacherId: user._id,
      students: [],
    });

    return courseId;
  },
});

// Update course details
export const updateCourse = mutation({
  args: {
    courseId: v.id("courses"),
    name: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    // Check if user is the teacher of this course
    if (course.teacherId !== user._id) {
      throw new Error("Not authorized to modify this course");
    }

    await ctx.db.patch(args.courseId, {
      name: args.name,
      description: args.description,
    });

    return args.courseId;
  },
});

// Add students to a course
export const addStudentsToCourse = mutation({
  args: {
    courseId: v.id("courses"),
    studentIds: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    // Check if user is the teacher of this course
    if (course.teacherId !== user._id) {
      throw new Error("Not authorized to modify this course");
    }

    // Add new students while avoiding duplicates
    const updatedStudents = [...new Set([...course.students, ...args.studentIds])];

    await ctx.db.patch(args.courseId, {
      students: updatedStudents,
    });

    return args.courseId;
  },
});

// Remove students from a course
export const removeStudentsFromCourse = mutation({
  args: {
    courseId: v.id("courses"),
    studentIds: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    // Check if user is the teacher of this course
    if (course.teacherId !== user._id) {
      throw new Error("Not authorized to modify this course");
    }

    // Remove specified students
    const updatedStudents = course.students.filter(
      (id) => !args.studentIds.includes(id)
    );

    await ctx.db.patch(args.courseId, {
      students: updatedStudents,
    });

    return args.courseId;
  },
});

// Create a new assignment
export const createAssignment = mutation({
  args: {
    courseId: v.id("courses"),
    title: v.string(),
    description: v.string(),
    dueDate: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    // Check if user is the teacher of this course
    if (course.teacherId !== user._id) {
      throw new Error("Not authorized to modify this course");
    }

    const assignmentId = await ctx.db.insert("assignments", {
      courseId: args.courseId,
      title: args.title,
      description: args.description,
      dueDate: args.dueDate,
    });

    return assignmentId;
  },
});

// Update an assignment
export const updateAssignment = mutation({
  args: {
    assignmentId: v.id("assignments"),
    title: v.string(),
    description: v.string(),
    dueDate: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) {
      throw new Error("Assignment not found");
    }

    const course = await ctx.db.get(assignment.courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    // Check if user is the teacher of this course
    if (course.teacherId !== user._id) {
      throw new Error("Not authorized to modify this assignment");
    }

    await ctx.db.patch(args.assignmentId, {
      title: args.title,
      description: args.description,
      dueDate: args.dueDate,
    });

    return args.assignmentId;
  },
});

// Delete an assignment
export const deleteAssignment = mutation({
  args: {
    assignmentId: v.id("assignments"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) {
      throw new Error("Assignment not found");
    }

    const course = await ctx.db.get(assignment.courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    // Check if user is the teacher of this course
    if (course.teacherId !== user._id) {
      throw new Error("Not authorized to delete this assignment");
    }

    await ctx.db.delete(args.assignmentId);
    return args.assignmentId;
  },
});