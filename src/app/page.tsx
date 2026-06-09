"use client";

import { useCallback, useEffect, useState } from "react";
import { generateScenario } from "@/lib/poker/scenario-generator";
import { validateAction } from "@/lib/poker/action-validator";
import { Scenario, UserAction } from "@/lib/poker/types";
import { ScenarioView } from "@/components/ScenarioView";
import { ActionBar } from "@/components/ActionBar";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { StatsPanel } from "@/components/StatsPanel";
import { useTrainerStats } from "@/hooks/useTrainerStats";

export default function Home() {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [explanation, setExplanation] = useState("");
  const { stats, record, reset, loaded } = useTrainerStats();

  const newScenario = useCallback(() => {
    setScenario(generateScenario());
    setAnswered(false);
    setIsCorrect(null);
    setExplanation("");
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      setScenario((current) => current ?? generateScenario());
    });
  }, []);

  const handleAction = (action: UserAction) => {
    if (!scenario || answered) return;
    const result = validateAction(scenario, action);
    setAnswered(true);
    setIsCorrect(result.isCorrect);
    setExplanation(result.explanation);
    record(result.isCorrect, scenario.zone, scenario.street, scenario.position);
  };

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Chargement...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950 px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="text-center">
          <h1 className="text-2xl font-bold text-white">Spin & Go Trainer</h1>
          <p className="text-sm text-slate-400">3-Max Hyper-Turbo — Stratégie mécanique</p>
        </header>

        <StatsPanel stats={stats} onReset={reset} />

        {scenario && (
          <>
            <ScenarioView scenario={scenario} />
            <ActionBar
              scenario={scenario}
              onAction={handleAction}
              disabled={answered}
            />
            <FeedbackPanel
              visible={answered}
              isCorrect={isCorrect}
              explanation={explanation}
              onNext={newScenario}
            />
          </>
        )}
      </div>
    </div>
  );
}
