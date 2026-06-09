import { ActionEvent, Street } from "./types";

const STREET_LABELS: Record<Street, string> = {
  preflop: "Pré-flop",
  flop: "Flop",
  turn: "Turn",
};

const STREET_ORDER: Street[] = ["preflop", "flop", "turn"];

const ACTION_LABELS: Record<string, string> = {
  fold: "fold",
  raise_2bb: "relance 2 BB",
  raise_4bb: "relance 4 BB",
  raise_6bb: "relance 6 BB",
  limp: "limp",
  check: "check",
  bet: "mise",
  bet_third: "mise 1/3",
  bet_half: "mise 1/2",
  allin: "tapis",
  call: "call",
};

export function formatActorLabel(actor: ActionEvent["actor"]): string {
  switch (actor) {
    case "hero":
      return "Hero";
    case "villain":
      return "Vilain";
    default:
      return actor;
  }
}

export function formatActionEvent(action: ActionEvent): string {
  return `${formatActorLabel(action.actor)} ${ACTION_LABELS[action.action] ?? action.action}`;
}

export interface ActionHistoryGroup {
  street: Street;
  actions: ActionEvent[];
  isCurrent: boolean;
}

export function groupActionHistoryByStreet(
  history: ActionEvent[],
  currentStreet: Street
): ActionHistoryGroup[] {
  if (history.length === 0) return [];

  const hasStreetTags = history.some((a) => a.street !== undefined);

  if (!hasStreetTags) {
    return [
      {
        street: currentStreet === "preflop" ? "preflop" : currentStreet,
        actions: history,
        isCurrent: true,
      },
    ];
  }

  const grouped = new Map<Street, ActionEvent[]>();
  for (const event of history) {
    const street = event.street ?? "preflop";
    const list = grouped.get(street) ?? [];
    list.push(event);
    grouped.set(street, list);
  }

  return STREET_ORDER.filter((s) => grouped.has(s)).map((street) => ({
    street,
    actions: grouped.get(street)!,
    isCurrent: street === currentStreet,
  }));
}

export function formatActionHistoryGroup(group: ActionHistoryGroup): string {
  return group.actions.map(formatActionEvent).join(", ");
}

export function formatActionHistory(history: ActionEvent[]): string {
  return history.map(formatActionEvent).join(" → ");
}

export function formatActionHistoryByStreet(
  history: ActionEvent[],
  currentStreet: Street
): string {
  return groupActionHistoryByStreet(history, currentStreet)
    .map((g) => `${STREET_LABELS[g.street]} : ${formatActionHistoryGroup(g)}`)
    .join(" | ");
}

export { STREET_LABELS };
