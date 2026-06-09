import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RangeCard } from "@/components/RangeCard";
import {
  RANGE_CATALOG,
  RANGE_SECTIONS,
  getCatalogBySection,
} from "@/lib/poker/ranges/catalog";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Ranges — Spin & Go Trainer",
  description: "Référence complète des ranges pré-flop Spin & Go 3-Max / HU",
};

export default function RangesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-8 space-y-4">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "text-slate-400 hover:text-white"
            )}
          >
            <ArrowLeft className="size-4" />
            Retour au trainer
          </Link>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">Référence des ranges</h1>
            <p className="max-w-2xl text-slate-400">
              Toutes les ranges pré-flop du simulateur, par position, zone de tapis
              et situation. Chaque matrice distingue les mains{" "}
              <span className="text-sky-400">suited (s)</span> et{" "}
              <span className="text-amber-400">offsuit (o)</span>, avec la notation
              détaillée sous chaque chart.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-emerald-700/50 text-emerald-400">
              🟢 Verte &gt; 15 BB
            </Badge>
            <Badge variant="outline" className="border-amber-700/50 text-amber-400">
              🟡 Jaune 10–15 BB
            </Badge>
            <Badge variant="outline" className="border-rose-700/50 text-rose-400">
              🔴 Rouge &lt; 10 BB
            </Badge>
          </div>
        </header>

        <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
          <nav className="lg:sticky lg:top-8 lg:h-fit lg:w-56 lg:shrink-0">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Sommaire
            </p>
            <ul className="space-y-4">
              {RANGE_SECTIONS.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#section-${section.id}`}
                    className="block text-sm font-medium text-slate-300 hover:text-white"
                  >
                    {section.emoji} {section.title}
                  </a>
                  <ul className="mt-1.5 space-y-1 border-l border-slate-800 pl-3">
                    {getCatalogBySection(section.id).map((entry) => (
                      <li key={entry.id}>
                        <a
                          href={`#${entry.id}`}
                          className="text-xs text-slate-500 hover:text-emerald-400"
                        >
                          {entry.position} — {entry.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-slate-600">
              {RANGE_CATALOG.length} situations · 169 combos pré-flop
            </p>
          </nav>

          <main className="min-w-0 flex-1 space-y-12">
            {RANGE_SECTIONS.map((section) => {
              const entries = getCatalogBySection(section.id);
              return (
                <section
                  key={section.id}
                  id={`section-${section.id}`}
                  className="scroll-mt-8 space-y-5"
                >
                  <div className="border-b border-slate-800 pb-3">
                    <h2 className="text-xl font-semibold text-white">
                      {section.emoji} {section.title}
                    </h2>
                    <p className="text-sm text-slate-500">{section.subtitle}</p>
                  </div>

                  <div className="space-y-6">
                    {entries.map((entry) => (
                      <RangeCard key={entry.id} entry={entry} />
                    ))}
                  </div>
                </section>
              );
            })}
          </main>
        </div>
      </div>
    </div>
  );
}
