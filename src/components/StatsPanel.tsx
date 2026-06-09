import { TrainerStats, accuracy } from "@/lib/stats/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface StatsPanelProps {
  stats: TrainerStats;
  onReset: () => void;
}

export function StatsPanel({ stats, onReset }: StatsPanelProps) {
  const pct = accuracy(stats.total, stats.correct);

  return (
    <Card className="border-slate-700 bg-slate-900/80">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base text-slate-100">Progression</CardTitle>
        <Button variant="ghost" size="sm" onClick={onReset} className="text-slate-400">
          Réinitialiser
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-4 text-sm text-slate-300">
          <span>
            Score : <strong className="text-white">{stats.correct}/{stats.total}</strong>
          </span>
          <span>
            Série : <strong className="text-white">{stats.streak}</strong>
          </span>
          <span>
            Meilleure : <strong className="text-white">{stats.bestStreak}</strong>
          </span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Précision globale</span>
            <span>{pct}%</span>
          </div>
          <Progress value={pct} className="h-2" />
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs text-slate-400">
          {(["green", "yellow", "red"] as const).map((z) => (
            <div key={z} className="rounded bg-slate-800 p-2">
              <div className="font-medium text-slate-300">
                {z === "green" ? "🟢" : z === "yellow" ? "🟡" : "🔴"}
              </div>
              <div>
                {accuracy(stats.byZone[z].total, stats.byZone[z].correct)}% (
                {stats.byZone[z].correct}/{stats.byZone[z].total})
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
