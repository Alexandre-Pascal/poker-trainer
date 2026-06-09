"use client";

import { useCallback, useEffect, useState } from "react";
import { Position, StackZone, Street } from "@/lib/poker/types";
import {
  loadStats,
  recordAnswer,
  saveStats,
  TrainerStats,
  createEmptyStats,
} from "@/lib/stats/storage";

export function useTrainerStats() {
  const [stats, setStats] = useState<TrainerStats>(createEmptyStats);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setStats(loadStats());
      setLoaded(true);
    });
  }, []);

  const record = useCallback(
    (correct: boolean, zone: StackZone, street: Street, position: Position) => {
      setStats((prev) => {
        const next = recordAnswer(prev, correct, zone, street, position);
        saveStats(next);
        return next;
      });
    },
    []
  );

  const reset = useCallback(() => {
    const empty = createEmptyStats();
    saveStats(empty);
    setStats(empty);
  }, []);

  return { stats, record, reset, loaded };
}
