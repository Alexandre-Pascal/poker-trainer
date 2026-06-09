import { Scenario, UserAction } from "@/lib/poker/types";
import { Button } from "@/components/ui/button";

const ACTION_LABELS: Record<UserAction, string> = {
  fold: "Fold",
  call: "Call",
  check: "Check",
  bet_third: "Bet 1/3",
  bet_half: "Bet 1/2",
  allin: "All-in",
  raise_2bb: "Raise 2 BB",
  raise_4bb: "Raise 4 BB",
  raise_6bb: "Raise 6 BB",
};

const ACTION_VARIANTS: Partial<Record<UserAction, "destructive" | "default" | "outline" | "secondary">> = {
  fold: "destructive",
  allin: "default",
  raise_2bb: "default",
  raise_4bb: "default",
  raise_6bb: "default",
  bet_third: "default",
  bet_half: "default",
};

interface ActionBarProps {
  scenario: Scenario;
  onAction: (action: UserAction) => void;
  disabled?: boolean;
}

export function ActionBar({ scenario, onAction, disabled }: ActionBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {scenario.availableActions.map((action) => (
        <Button
          key={action}
          variant={ACTION_VARIANTS[action] ?? "outline"}
          disabled={disabled}
          onClick={() => onAction(action)}
          className="min-w-[100px]"
        >
          {ACTION_LABELS[action]}
        </Button>
      ))}
    </div>
  );
}
