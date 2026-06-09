import {
  PLAYER_COUNT_LABELS,
  type RangeCatalogEntry,
} from "@/lib/poker/ranges/catalog";
import {
  countHandsInRange,
  countRangeByType,
  groupRangeEntries,
  rangePercentage,
} from "@/lib/poker/ranges/matrix";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RangeMatrix, RangeMatrixLegend } from "@/components/RangeMatrix";
import { cn } from "@/lib/utils";

type RangeCardProps = {
  entry: RangeCatalogEntry;
};

function RangeNotationGroup({
  label,
  entries,
  className,
}: {
  label: string;
  entries: string[];
  className: string;
}) {
  if (entries.length === 0) return null;

  return (
    <div className="space-y-1">
      <p className={cn("text-xs font-semibold uppercase tracking-wide", className)}>
        {label}
      </p>
      <p className="font-mono text-xs leading-relaxed text-slate-300">
        {entries.join(", ")}
      </p>
    </div>
  );
}

export function RangeCard({ entry }: RangeCardProps) {
  const handCount = countHandsInRange(entry.rangeText);
  const pct = rangePercentage(entry.rangeText);
  const byType = countRangeByType(entry.rangeText);
  const grouped = groupRangeEntries(entry.rangeText);

  return (
    <Card
      id={entry.id}
      className="scroll-mt-24 border-slate-700/50 bg-slate-900/60 ring-slate-700/40"
    >
      <CardHeader className="border-b border-slate-800/80">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg text-white">{entry.title}</CardTitle>
            <CardDescription className="text-slate-400">
              {entry.description}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className="border-slate-600 text-slate-300">
              {entry.position}
            </Badge>
            <Badge variant="outline" className="border-slate-600 text-slate-300">
              {PLAYER_COUNT_LABELS[entry.playerCount]}
            </Badge>
            <Badge variant="secondary" className="bg-slate-800 text-slate-300">
              {entry.zoneLabel}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-5">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Situation</dt>
            <dd className="text-slate-200">{entry.situation}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Action</dt>
            <dd className="font-medium text-emerald-400">{entry.action}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-slate-500">Mains dans la range</dt>
            <dd className="text-slate-200">
              {handCount} / 169{" "}
              <span className="text-slate-500">({pct} %)</span>
              <span className="mt-1 block text-xs text-slate-500">
                {byType.pairs} paires · {byType.suited} suited ·{" "}
                {byType.offsuit} offsuit
              </span>
            </dd>
          </div>
        </dl>

        <div className="space-y-3">
          <RangeMatrixLegend layers={entry.layers} />
          <RangeMatrix layers={entry.layers} />
        </div>

        <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-950/50 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Notation par type de main
          </p>
          <RangeNotationGroup
            label="Paires"
            entries={grouped.pairs}
            className="text-slate-300"
          />
          <RangeNotationGroup
            label="Suited (s) — même couleur"
            entries={grouped.suited}
            className="text-sky-400"
          />
          <RangeNotationGroup
            label="Offsuit (o) — couleurs différentes"
            entries={grouped.offsuit}
            className="text-amber-400"
          />
        </div>
      </CardContent>
    </Card>
  );
}
