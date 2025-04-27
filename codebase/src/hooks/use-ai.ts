"use client";

import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useAi() {
  const generateIepGoal = useAction(api.ai.generateIepGoal);

  return { generateIepGoal };
}
