import { Scenario } from "@/lib/poker/types";
import { formatPositionLabel } from "@/lib/poker/effective-position";
import { zoneEmoji, zoneLabel } from "@/lib/poker/stack-zone";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActionHistoryTimeline } from "./ActionHistoryTimeline";
import { PlayingCard } from "./PlayingCard";

interface ScenarioViewProps {
  scenario: Scenario;
}

export function ScenarioView({ scenario }: ScenarioViewProps) {
  const posLabel = formatPositionLabel(scenario.position, scenario.playerCount);
  const modeLabel =
    scenario.playerCount === "headsUp" ? "Heads-Up" : "3-Max";

  return (
    <Card className="border-slate-700 bg-slate-900/80">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-emerald-500 text-emerald-400">
            {zoneEmoji(scenario.zone)} {zoneLabel(scenario.zone)}
          </Badge>
          <Badge variant="secondary">{posLabel}</Badge>
          <Badge variant="secondary">{modeLabel}</Badge>
          <Badge variant="secondary">{scenario.stackBB} BB</Badge>
          <Badge variant="secondary">
            {scenario.street === "preflop"
              ? "Pré-flop"
              : scenario.street === "flop"
                ? "Flop"
                : "Turn"}
          </Badge>
        </div>
        <CardTitle className="text-lg text-slate-100">
          Pot : {scenario.potBB.toFixed(1)} BB
          {scenario.callAmountBB > 0 && (
            <span className="ml-2 text-sm font-normal text-amber-400">
              (à payer : {scenario.callAmountBB.toFixed(1)} BB)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="mb-2 text-sm text-slate-400">Ta main</p>
          <div className="flex gap-2">
            <PlayingCard card={scenario.holeCards[0]} />
            <PlayingCard card={scenario.holeCards[1]} />
          </div>
        </div>

        {scenario.board.length > 0 && (
          <div>
            <p className="mb-2 text-sm text-slate-400">Board</p>
            <div className="flex gap-2">
              {scenario.board.map((c, i) => (
                <PlayingCard key={`${c.rank}${c.suit}-${i}`} card={c} />
              ))}
            </div>
          </div>
        )}

        {scenario.actionHistory.length > 0 && (
          <ActionHistoryTimeline scenario={scenario} />
        )}
      </CardContent>
    </Card>
  );
}
