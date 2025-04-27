import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// 1. Fetch a single IEP Draft by ID
export const getDraft = query({
  args: { draftId: v.id("iepDrafts") },
  handler: async (ctx, { draftId }) => {
    return await ctx.db.get(draftId);
  },
});

// 2. Update fields in an IEP Draft
export const updateDraft = mutation({
  args: { draftId: v.id("iepDrafts"), data: v.any() },
  handler: async (ctx, { draftId, data }) => {
    await ctx.db.patch(draftId, data);
  },
});

// 3. Save a generated SMART goal into the Draft
export const saveGeneratedGoalToDraft = mutation({
  args: {
    draftId: v.id("iepDrafts"),
    newGoal: v.string(),
  },
  handler: async (ctx, { draftId, newGoal }) => {
    const draft = await ctx.db.get(draftId);
    if (!draft) {
      throw new Error("Draft not found");
    }

    const updatedGoals = draft.goals ? [...draft.goals, newGoal] : [newGoal];

    await ctx.db.patch(draftId, {
      goals: updatedGoals,
    });
  },
});
