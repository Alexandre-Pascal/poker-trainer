import { Scenario } from "@/lib/poker/types";
import {
  formatActionHistoryGroup,
  groupActionHistoryByStreet,
  STREET_LABELS,
} from "@/lib/poker/action-history";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ActionHistoryTimelineProps {
  scenario: Scenario;
}

export function ActionHistoryTimeline({ scenario }: ActionHistoryTimelineProps) {
  const groups = groupActionHistoryByStreet(
    scenario.actionHistory,
    scenario.street
  );

  if (groups.length === 0) return null;

  return (
    <div className="space-y-2.5 rounded-md bg-slate-800/60 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        Historique
      </p>
      <div className="space-y-2">
        {groups.map((group) => (
          <div
            key={group.street}
            className={cn(
              "flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm",
              group.isCurrent ? "text-slate-100" : "text-slate-500"
            )}
          >
            <Badge
              variant="outline"
              className={cn(
                "shrink-0 text-xs",
                group.isCurrent
                  ? "border-slate-500 text-slate-200"
                  : "border-slate-700 text-slate-500"
              )}
            >
              {STREET_LABELS[group.street]}
            </Badge>
            <span>{formatActionHistoryGroup(group)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
