import {
  BB_DEFENSE_VS_ALLIN,
  GREEN_BB_3BET,
  GREEN_BB_CALL,
  GREEN_BB_ISOLATE,
  GREEN_BTN_OPEN,
  GREEN_SB_3BET,
  GREEN_SB_BTN_FOLD,
  GREEN_SB_COMPLETE,
  GREEN_SB_ISOLATE,
  PUSH_BTN,
  WIDE_PUSH,
} from "./data";
import {
  BB_PUSH_SHORT_3MAX,
  PUSH_HU_MAX_PRESSURE,
  PUSH_SB_3MAX,
} from "./push-fold";
import type { MatrixLayer } from "./matrix";
import type { PlayerCount, Position, StackZone } from "../types";

export type RangeCatalogEntry = {
  id: string;
  title: string;
  zone: StackZone | "mixed";
  zoneLabel: string;
  playerCount: PlayerCount | "both";
  position: Position;
  situation: string;
  action: string;
  description: string;
  layers: MatrixLayer[];
  rangeText: string[];
};

const LAYER = {
  open: {
    id: "open",
    label: "Jouer",
    activeClass: "bg-emerald-500/90 text-emerald-950 font-semibold",
  },
  threeBet: {
    id: "3bet",
    label: "3-Bet",
    activeClass: "bg-amber-500/90 text-amber-950 font-semibold",
  },
  call: {
    id: "call",
    label: "Call",
    activeClass: "bg-sky-500/90 text-sky-950 font-semibold",
  },
  isolate: {
    id: "isolate",
    label: "Isoler 4 BB",
    activeClass: "bg-violet-500/90 text-violet-950 font-semibold",
  },
  complete: {
    id: "complete",
    label: "Compléter",
    activeClass: "bg-sky-500/80 text-sky-950 font-medium",
  },
  push: {
    id: "push",
    label: "Tapis",
    activeClass: "bg-rose-500/90 text-rose-950 font-semibold",
  },
  defend: {
    id: "defend",
    label: "Défense",
    activeClass: "bg-orange-500/90 text-orange-950 font-semibold",
  },
} as const;

function layer(
  key: keyof typeof LAYER,
  entries: string[]
): MatrixLayer {
  const base = LAYER[key];
  return { ...base, entries };
}

export const RANGE_SECTIONS = [
  {
    id: "green",
    title: "Zone verte",
    subtitle: "> 15 BB — Jeu standard",
    emoji: "🟢",
  },
  {
    id: "short",
    title: "Zone jaune & rouge",
    subtitle: "≤ 15 BB — Push / Fold & survie",
    emoji: "🟡🔴",
  },
  {
    id: "defense",
    title: "Défense & pot-committed",
    subtitle: "Face à un tapis ou mini-relance short",
    emoji: "🛡️",
  },
] as const;

export const RANGE_CATALOG: RangeCatalogEntry[] = [
  {
    id: "green-btn-open",
    title: "Ouverture BTN",
    zone: "green",
    zoneLabel: "> 15 BB",
    playerCount: "3max",
    position: "BTN",
    situation: "Premier à parler, pot non ouvert",
    action: "Raise 2 BB",
    description: "Range d'ouverture standard depuis le bouton en 3-Max.",
    layers: [layer("open", GREEN_BTN_OPEN)],
    rangeText: GREEN_BTN_OPEN,
  },
  {
    id: "green-sb-btn-fold",
    title: "Ouverture SB (BTN fold)",
    zone: "green",
    zoneLabel: "> 15 BB",
    playerCount: "both",
    position: "SB",
    situation: "Le bouton se couche — SB premier à parler",
    action: "Raise 2 BB",
    description:
      "En HU, le BTN est fusionné en SB. Même range qu'en 3-Max SB vs fold BTN.",
    layers: [layer("open", GREEN_SB_BTN_FOLD)],
    rangeText: GREEN_SB_BTN_FOLD,
  },
  {
    id: "green-sb-vs-raise",
    title: "SB vs relance BTN",
    zone: "green",
    zoneLabel: "> 15 BB",
    playerCount: "3max",
    position: "SB",
    situation: "Face à une relance 2 BB du bouton",
    action: "3-Bet 6 BB",
    description: "Sur-relance value / bluff sélectif. Hors range → Fold.",
    layers: [layer("threeBet", GREEN_SB_3BET)],
    rangeText: GREEN_SB_3BET,
  },
  {
    id: "green-sb-vs-limp",
    title: "SB vs limp BTN",
    zone: "green",
    zoneLabel: "> 15 BB",
    playerCount: "3max",
    position: "SB",
    situation: "Le bouton limp",
    action: "Isoler 4 BB ou Compléter",
    description: "Isoler avec les mains fortes, compléter les specs en SB.",
    layers: [
      layer("isolate", GREEN_SB_ISOLATE),
      layer("complete", GREEN_SB_COMPLETE),
    ],
    rangeText: [...GREEN_SB_ISOLATE, ...GREEN_SB_COMPLETE],
  },
  {
    id: "green-bb-vs-raise",
    title: "BB vs relance",
    zone: "green",
    zoneLabel: "> 15 BB",
    playerCount: "both",
    position: "BB",
    situation: "Face à une relance (BTN ou Vilain en HU)",
    action: "3-Bet 6 BB ou Call",
    description: "3-bet les premiums, call la range de défense large.",
    layers: [
      layer("threeBet", GREEN_BB_3BET),
      layer("call", GREEN_BB_CALL),
    ],
    rangeText: [...GREEN_BB_3BET, ...GREEN_BB_CALL],
  },
  {
    id: "green-bb-vs-limp",
    title: "BB vs limp",
    zone: "green",
    zoneLabel: "> 15 BB",
    playerCount: "both",
    position: "BB",
    situation: "Un adversaire limp (BTN ou SB)",
    action: "Isoler 4 BB ou Check",
    description: "Isoler les mains fortes, checker gratuitement le reste.",
    layers: [layer("isolate", GREEN_BB_ISOLATE)],
    rangeText: GREEN_BB_ISOLATE,
  },
  {
    id: "push-btn",
    title: "Push BTN",
    zone: "red",
    zoneLabel: "≤ 10 BB",
    playerCount: "3max",
    position: "BTN",
    situation: "Premier à parler, zone Push/Fold",
    action: "All-in ou Fold",
    description: "Push or Fold depuis le bouton en tapis court 3-Max.",
    layers: [layer("push", PUSH_BTN)],
    rangeText: PUSH_BTN,
  },
  {
    id: "push-btn-wide",
    title: "Push BTN élargi",
    zone: "yellow",
    zoneLabel: "11–12 BB",
    playerCount: "3max",
    position: "BTN",
    situation: "Premier à parler, zone Push élargi",
    action: "All-in ou Fold",
    description: "Push élargi depuis le bouton entre 11 et 12 BB en 3-Max.",
    layers: [layer("push", WIDE_PUSH)],
    rangeText: WIDE_PUSH,
  },
  {
    id: "sb-pot-committed",
    title: "SB vs mini-relance / limp",
    zone: "mixed",
    zoneLabel: "≤ 15 BB",
    playerCount: "3max",
    position: "SB",
    situation: "Face à open 2 BB ou limp du BTN (pot-committed)",
    action: "All-in ou Fold",
    description:
      "Pas de call en tapis court — rejoue avec la range push SB ou fold.",
    layers: [layer("push", PUSH_SB_3MAX)],
    rangeText: PUSH_SB_3MAX,
  },
  {
    id: "push-sb-3max",
    title: "Push SB (BTN fold)",
    zone: "mixed",
    zoneLabel: "≤ 12 BB",
    playerCount: "3max",
    position: "SB",
    situation: "BTN fold — range stricte 3-Max",
    action: "All-in ou Fold",
    description: "Catégorie A : range serrée conservée en 3-Max short stack.",
    layers: [layer("push", PUSH_SB_3MAX)],
    rangeText: PUSH_SB_3MAX,
  },
  {
    id: "push-hu-max",
    title: "Push HU — Pression maximale",
    zone: "mixed",
    zoneLabel: "≤ 12 BB",
    playerCount: "headsUp",
    position: "SB",
    situation: "HU BTN/SB premier à parler",
    action: "All-in ou Fold",
    description:
      "Catégorie B : top ~80 % des mains. 84o fold, 85s push. Voler la blinde agressivement.",
    layers: [layer("push", PUSH_HU_MAX_PRESSURE)],
    rangeText: PUSH_HU_MAX_PRESSURE,
  },
  {
    id: "bb-shove-vs-limp",
    title: "BB iso-shove vs limp",
    zone: "mixed",
    zoneLabel: "≤ 15 BB",
    playerCount: "both",
    position: "BB",
    situation: "Adversaire limp (BTN ou SB) — la BB peut isoler par tapis",
    action: "All-in ou Check",
    description:
      "En tapis court, punir les limps récréatifs par un shove large. Mains faibles → check gratuit.",
    layers: [layer("push", BB_PUSH_SHORT_3MAX)],
    rangeText: BB_PUSH_SHORT_3MAX,
  },
  {
    id: "bb-rejam-short",
    title: "BB re-jam vs mini-relance",
    zone: "mixed",
    zoneLabel: "≤ 15 BB",
    playerCount: "both",
    position: "BB",
    situation: "Face à un raise 2 BB avec un micro-tapis",
    action: "All-in ou Fold",
    description:
      "L'adversaire est pot-committed — pas de call. Re-joue avec la range push BB ou fold.",
    layers: [layer("push", BB_PUSH_SHORT_3MAX)],
    rangeText: BB_PUSH_SHORT_3MAX,
  },
  {
    id: "bb-defense-allin",
    title: "BB vs tapis adverse",
    zone: "mixed",
    zoneLabel: "≤ 15 BB",
    playerCount: "both",
    position: "BB",
    situation: "Face à un tapis adverse (BTN, SB ou Vilain HU)",
    action: "Call ou Fold",
    description:
      "Range de survie stricte quand l'adversaire fait tapis — Call ou Fold uniquement.",
    layers: [layer("defend", BB_DEFENSE_VS_ALLIN)],
    rangeText: BB_DEFENSE_VS_ALLIN,
  },
  {
    id: "sb-defense-allin",
    title: "SB vs tapis BTN",
    zone: "mixed",
    zoneLabel: "≤ 15 BB",
    playerCount: "3max",
    position: "SB",
    situation: "Le bouton fait tapis",
    action: "Call ou Fold",
    description: "Défense SB en zone courte face à un shove du bouton.",
    layers: [layer("defend", BB_DEFENSE_VS_ALLIN)],
    rangeText: BB_DEFENSE_VS_ALLIN,
  },
];

export function getCatalogBySection(sectionId: string): RangeCatalogEntry[] {
  switch (sectionId) {
    case "green":
      return RANGE_CATALOG.filter((e) => e.zone === "green");
    case "short":
      return RANGE_CATALOG.filter(
        (e) =>
          e.id.startsWith("push-") ||
          e.id === "sb-pot-committed" ||
          e.id === "bb-shove-vs-limp" ||
          e.id === "bb-rejam-short"
      );
    case "defense":
      return RANGE_CATALOG.filter(
        (e) =>
          e.id === "bb-defense-allin" || e.id.startsWith("sb-defense")
      );
    default:
      return RANGE_CATALOG;
  }
}

export const PLAYER_COUNT_LABELS: Record<PlayerCount | "both", string> = {
  "3max": "3-Max",
  headsUp: "Heads-Up",
  both: "3-Max & HU",
};
