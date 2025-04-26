import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { getCurrentUser } from "./users";

// List all students that are enrolled in any of the teacher's courses
export const listStudents = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    // Get all courses taught by this teacher
    const teacherCourses = await ctx.db
      .query("courses")
      .withIndex("by_teacher", (q) => q.eq("teacherId", user._id))
      .collect();

    // Get unique student IDs from all courses
    const studentIds = new Set<Id<"users">>();
    teacherCourses.forEach((course) => {
      course.students.forEach((studentId) => {
        studentIds.add(studentId);
      });
    });

    // Get student details
    const students = await Promise.all(
      Array.from(studentIds).map(async (studentId) => {
        const student = await ctx.db.get(studentId);
        if (!student) return null;

        // Get courses this student is enrolled in (taught by this teacher)
        const enrolledCourses = teacherCourses.filter((course) =>
          course.students.includes(studentId)
        );

        // Get student's grades for these courses
        const grades = await ctx.db
          .query("grades")
          .withIndex("by_student", (q) => q.eq("studentId", studentId))
          .collect();

        // Get student's attendance records
        const attendance = await ctx.db
          .query("attendance")
          .withIndex("by_student", (q) => q.eq("studentId", studentId))
          .collect();

        return {
          ...student,
          enrolledCourses,
          grades,
          attendance,
        };
      })
    );

    return students.filter((s): s is NonNullable<typeof s> => s !== null);
  },
});

// Get detailed information about a specific student
export const getStudentDetails = query({
  args: {
    studentId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const student = await ctx.db.get(args.studentId);
    if (!student) {
      throw new Error("Student not found");
    }

    // Get courses taught by this teacher
    const teacherCourses = await ctx.db
      .query("courses")
      .withIndex("by_teacher", (q) => q.eq("teacherId", user._id))
      .collect();

    // Get courses this student is enrolled in (taught by this teacher)
    const enrolledCourses = teacherCourses.filter((course) =>
      course.students.includes(args.studentId)
    );

    // Get student's grades
    const grades = await ctx.db
      .query("grades")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect();

    // Get student's attendance records
    const attendance = await ctx.db
      .query("attendance")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect();

    return {
      ...student,
      enrolledCourses,
      grades,
      attendance,
    };
  },
});

// Record attendance for a student
export const recordAttendance = mutation({
  args: {
    studentId: v.id("users"),
    courseId: v.id("courses"),
    date: v.number(),
    present: v.boolean(),
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
      throw new Error("Not authorized to record attendance for this course");
    }

    // Check if student is enrolled in this course
    if (!course.students.includes(args.studentId)) {
      throw new Error("Student is not enrolled in this course");
    }

    // Record attendance
    const attendanceId = await ctx.db.insert("attendance", {
      studentId: args.studentId,
      courseId: args.courseId,
      date: args.date,
      present: args.present,
    });

    return attendanceId;
  },
});

// Record a grade for a student's assignment
export const recordGrade = mutation({
  args: {
    studentId: v.id("users"),
    assignmentId: v.id("assignments"),
    courseId: v.id("courses"),
    score: v.number(),
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
      throw new Error("Not authorized to record grades for this course");
    }

    // Check if student is enrolled in this course
    if (!course.students.includes(args.studentId)) {
      throw new Error("Student is not enrolled in this course");
    }

    // Record grade
    const gradeId = await ctx.db.insert("grades", {
      studentId: args.studentId,
      assignmentId: args.assignmentId,
      courseId: args.courseId,
      score: args.score,
    });

    return gradeId;
  },
});