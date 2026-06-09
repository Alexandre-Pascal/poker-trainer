"use client";

import { Fragment } from "react";
import {
  MATRIX_RANKS,
  expandRangeToHandSet,
  matrixCellNotation,
  type MatrixLayer,
} from "@/lib/poker/ranges/matrix";
import { cn } from "@/lib/utils";

type RangeMatrixProps = {
  layers: MatrixLayer[];
  compact?: boolean;
};

export function RangeMatrixLayoutGuide() {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2.5 text-xs text-slate-400">
      <p className="font-medium text-slate-300">Lecture de la matrice 13×13</p>
      <ul className="mt-1.5 space-y-1">
        <li className="flex items-center gap-2">
          <span className="inline-flex h-5 w-10 items-center justify-center rounded bg-sky-950/80 font-mono text-[10px] text-sky-300 ring-1 ring-sky-800/50">
            AKs
          </span>
          <span>
            <strong className="text-sky-300">Au-dessus</strong> de la diagonale —
            mains <strong className="text-sky-300">suited</strong> (même couleur)
          </span>
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-flex h-5 w-10 items-center justify-center rounded bg-amber-950/80 font-mono text-[10px] text-amber-300 ring-1 ring-amber-800/50">
            AKo
          </span>
          <span>
            <strong className="text-amber-300">En dessous</strong> de la diagonale —
            mains <strong className="text-amber-300">offsuit</strong> (couleurs différentes)
          </span>
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-flex h-5 w-10 items-center justify-center rounded bg-slate-800 font-mono text-[10px] text-slate-200 ring-1 ring-slate-600">
            AA
          </span>
          <span>
            <strong className="text-slate-200">Sur la diagonale</strong> — paires
          </span>
        </li>
      </ul>
    </div>
  );
}

export function RangeMatrix({ layers, compact = false }: RangeMatrixProps) {
  const sets = layers.map((l) => ({
    ...l,
    hands: expandRangeToHandSet(l.entries),
  }));

  const cellSize = compact
    ? "h-7 w-8 text-[8px]"
    : "h-8 w-9 text-[9px] sm:h-9 sm:w-10 sm:text-[10px]";

  return (
    <div className="space-y-3">
      <RangeMatrixLayoutGuide />
      <div className="overflow-x-auto">
        <div className="inline-block min-w-0">
          <div
            className="grid gap-px rounded-lg bg-slate-700/50 p-px"
            style={{
              gridTemplateColumns: `repeat(${MATRIX_RANKS.length + 1}, minmax(0, 1fr))`,
            }}
          >
            <div className={cn(cellSize, "flex items-center justify-center")} />
            {MATRIX_RANKS.map((rank) => (
              <div
                key={`col-${rank}`}
                className={cn(
                  cellSize,
                  "flex items-center justify-center font-mono font-medium text-slate-500"
                )}
              >
                {rank}
              </div>
            ))}

            {MATRIX_RANKS.map((rowRank, row) => (
              <Fragment key={`row-${rowRank}`}>
                <div
                  className={cn(
                    cellSize,
                    "flex items-center justify-center font-mono font-medium text-slate-500"
                  )}
                >
                  {rowRank}
                </div>
                {MATRIX_RANKS.map((_, col) => {
                  const notation = matrixCellNotation(row, col);
                  const isPair = row === col;
                  const isSuited = !isPair && row < col;
                  const isOffsuit = !isPair && row > col;

                  const activeLayer = sets.findLast((s) =>
                    s.hands.has(notation.toUpperCase())
                  );

                  const inactiveBg = isSuited
                    ? "bg-sky-950/30 text-slate-600 ring-1 ring-sky-900/20"
                    : isOffsuit
                      ? "bg-amber-950/20 text-slate-600 ring-1 ring-amber-900/15"
                      : "bg-slate-800/80 text-slate-600";

                  const suffixClass = isSuited
                    ? "text-sky-200/90"
                    : isOffsuit
                      ? "text-amber-200/90"
                      : "";

                  return (
                    <div
                      key={`${row}-${col}`}
                      title={notation}
                      className={cn(
                        cellSize,
                        "flex items-center justify-center rounded-sm font-mono leading-none transition-colors",
                        activeLayer ? activeLayer.activeClass : inactiveBg
                      )}
                    >
                      {isPair ? (
                        notation
                      ) : (
                        <span>
                          {notation.slice(0, 2)}
                          <span
                            className={cn(
                              "text-[0.85em] font-bold",
                              activeLayer ? "opacity-90" : suffixClass
                            )}
                          >
                            {isSuited ? "s" : "o"}
                          </span>
                        </span>
                      )}
                    </div>
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function RangeMatrixLegend({ layers }: { layers: MatrixLayer[] }) {
  if (layers.length <= 1) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {layers.map((layer) => (
        <div
          key={layer.id}
          className="flex items-center gap-1.5 text-xs text-slate-400"
        >
          <span
            className={cn(
              "inline-block h-3 w-3 rounded-sm ring-1 ring-white/10",
              layer.activeClass.split(" ").find((c) => c.startsWith("bg-"))
            )}
          />
          {layer.label}
        </div>
      ))}
    </div>
  );
}
