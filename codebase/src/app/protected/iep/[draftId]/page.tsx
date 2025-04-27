"use client";

import { useAi } from "@/hooks/use-ai";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from "next/navigation";

export default function IepDraftPage() {
  const { draftId } = useParams(); // this gives you the draft ID from URL
  const { generateIepGoal } = useAi();
  const [goal, setGoal] = useState<string>("");

  async function handleGenerateGoal() {
    const plafp = "Student struggles with reading fluency and decoding multi-syllabic words.";
    const smartGoal = await generateIepGoal({ plafp });
    setGoal(smartGoal);
  }

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>IEP Draft - Auto Goal Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGenerateGoal}>Generate SMART Goal</Button>

          {goal && (
            <div className="mt-6 p-4 bg-muted rounded-md">
              <h4 className="text-lg font-medium mb-2">Generated SMART Goal:</h4>
              <p className="text-muted-foreground">{goal}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
