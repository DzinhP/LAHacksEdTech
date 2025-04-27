"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useAction } from "convex/react";

import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function IepDraftPage() {
  const { draftId } = useParams();
  const draft = useQuery(api.iepDrafts.getDraft, draftId ? { draftId: draftId as any } : "skip");
  const generateIepGoal = useAction(api.ai.generateIepGoal);
  const saveGeneratedGoal = useMutation(api.iepDrafts.saveGeneratedGoalToDraft);

  const [goal, setGoal] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleGenerateGoal() {
    if (!draft?.plafp) {
      alert("No PLAAFP found for this draft.");
      return;
    }

    setLoading(true);
    try {
      const smartGoal = await generateIepGoal({ plafp: draft.plafp });
      setGoal(smartGoal);
    } catch (error) {
      console.error("Failed to generate goal:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveGoal() {
    if (!goal) {
      alert("Please generate a goal first.");
      return;
    }

    setSaving(true);
    try {
      await saveGeneratedGoal({ draftId: draftId as any, newGoal: goal });
      alert("Goal saved successfully!");
    } catch (error) {
      console.error("Failed to save goal:", error);
    } finally {
      setSaving(false);
    }
  }

  if (draft === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="container text-center py-20">
        <h2 className="text-xl font-bold">Draft not found</h2>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>IEP Draft - {draft.status.toUpperCase()}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="text-lg font-medium mb-2">Present Levels (PLAAFP)</h4>
            <p className="text-muted-foreground">{draft.plafp}</p>
          </div>

          <Button onClick={handleGenerateGoal} disabled={loading}>
            {loading ? "Generating..." : "Generate SMART Goal"}
          </Button>

          {goal && (
            <div className="mt-6 p-4 bg-muted rounded-md">
              <h4 className="text-lg font-medium mb-2">Generated SMART Goal:</h4>
              <p className="text-muted-foreground">{goal}</p>

              <Button
                className="mt-4"
                onClick={handleSaveGoal}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Goal to Draft"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
