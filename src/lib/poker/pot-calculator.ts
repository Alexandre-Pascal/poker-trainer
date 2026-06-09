import { ActionEvent, PlayerCount, Position, PreviousActionType } from "./types";

const SB_BLIND = 0.5;
const BB_BLIND = 1;

/**
 * Calcule le pot pré-flop à partir des blindes et de l'historique.
 * Hypothèse Spin & Go : relance "raise_2bb" = mise totale de 2 BB au milieu.
 */
export function computePreflopPotBB(
  playerCount: PlayerCount,
  position: Position,
  history: ActionEvent[],
  facingAction: PreviousActionType | null,
  isFirstToAct: boolean
): number {
  if (playerCount === "headsUp") {
    if (isFirstToAct) {
      return SB_BLIND + BB_BLIND;
    }

    const villainAction = history.find(
      (a) => a.actor === "villain" || a.actor === "BTN"
    );

    if (villainAction?.action === "raise_2bb") {
      return BB_BLIND + (villainAction.amountBB ?? 2);
    }

    if (villainAction?.action === "allin") {
      return BB_BLIND + (villainAction.amountBB ?? 0);
    }

    return SB_BLIND + BB_BLIND;
  }

  // 3-max : SB 0.5 + BB 1 toujours dans le pot
  let pot = SB_BLIND + BB_BLIND;

  const btnRaise = history.find(
    (a) => a.actor === "BTN" && a.action === "raise_2bb"
  );
  if (btnRaise) {
    pot = SB_BLIND + BB_BLIND + (btnRaise.amountBB ?? 2);
    return pot;
  }

  const btnRaise4 = history.find(
    (a) => a.actor === "BTN" && a.action === "raise_4bb"
  );
  if (btnRaise4) {
    pot = SB_BLIND + BB_BLIND + (btnRaise4.amountBB ?? 4);
    return pot;
  }

  if (!isFirstToAct && facingAction === "allin") {
    const allin = history.find((a) => a.action === "allin");
    return SB_BLIND + BB_BLIND + (allin?.amountBB ?? 0);
  }

  return pot;
}
