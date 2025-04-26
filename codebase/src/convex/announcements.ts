import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { getCurrentUser } from "./users";

// List all announcements for the teacher
export const listAnnouncements = query({
  args: {
    courseId: v.optional(v.id("courses")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    // Start query with teacher filter
    let announcementsQuery = ctx.db
      .query("announcements")
      .withIndex("by_teacher", (q) => q.eq("teacherId", user._id));

    // If courseId is provided, filter by course
    if (args.courseId) {
      announcementsQuery = announcementsQuery.filter((q) =>
        q.eq(q.field("courseId"), args.courseId)
      );
    }

    // Get announcements ordered by date (newest first)
    const announcements = await announcementsQuery
      .order("desc")
      .collect();

    // Get course details for each announcement
    const announcementsWithCourses = await Promise.all(
      announcements.map(async (announcement) => {
        if (!announcement.courseId) {
          return { ...announcement, course: null };
        }

        const course = await ctx.db.get(announcement.courseId);
        return {
          ...announcement,
          course,
        };
      })
    );

    return announcementsWithCourses;
  },
});

// Create a new announcement
export const createAnnouncement = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    courseId: v.optional(v.id("courses")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    // If courseId is provided, verify the teacher owns the course
    if (args.courseId) {
      const course = await ctx.db.get(args.courseId);
      if (!course) {
        throw new Error("Course not found");
      }
      if (course.teacherId !== user._id) {
        throw new Error("Not authorized to create announcements for this course");
      }
    }

    const announcementId = await ctx.db.insert("announcements", {
      title: args.title,
      content: args.content,
      teacherId: user._id,
      courseId: args.courseId,
      date: Date.now(),
    });

    return announcementId;
  },
});

// Update an announcement
export const updateAnnouncement = mutation({
  args: {
    announcementId: v.id("announcements"),
    title: v.string(),
    content: v.string(),
    courseId: v.optional(v.id("courses")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const announcement = await ctx.db.get(args.announcementId);
    if (!announcement) {
      throw new Error("Announcement not found");
    }

    // Check if user is the teacher who created the announcement
    if (announcement.teacherId !== user._id) {
      throw new Error("Not authorized to modify this announcement");
    }

    // If courseId is provided, verify the teacher owns the course
    if (args.courseId) {
      const course = await ctx.db.get(args.courseId);
      if (!course) {
        throw new Error("Course not found");
      }
      if (course.teacherId !== user._id) {
        throw new Error("Not authorized to create announcements for this course");
      }
    }

    await ctx.db.patch(args.announcementId, {
      title: args.title,
      content: args.content,
      courseId: args.courseId,
    });

    return args.announcementId;
  },
});

// Delete an announcement
export const deleteAnnouncement = mutation({
  args: {
    announcementId: v.id("announcements"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const announcement = await ctx.db.get(args.announcementId);
    if (!announcement) {
      throw new Error("Announcement not found");
    }

    // Check if user is the teacher who created the announcement
    if (announcement.teacherId !== user._id) {
      throw new Error("Not authorized to delete this announcement");
    }

    await ctx.db.delete(args.announcementId);
    return args.announcementId;
  },
});