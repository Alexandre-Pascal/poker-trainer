import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FeedbackPanelProps {
  visible: boolean;
  isCorrect: boolean | null;
  explanation: string;
  onNext: () => void;
}

export function FeedbackPanel({
  visible,
  isCorrect,
  explanation,
  onNext,
}: FeedbackPanelProps) {
  if (!visible || isCorrect === null) return null;

  return (
    <Card
      className={cn(
        "border-2",
        isCorrect ? "border-emerald-500 bg-emerald-950/30" : "border-red-500 bg-red-950/30"
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className={isCorrect ? "text-emerald-400" : "text-red-400"}>
          {isCorrect ? "Correct !" : "Incorrect"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="whitespace-pre-line text-sm text-slate-200">{explanation}</p>
        <Button onClick={onNext}>Prochain scénario</Button>
      </CardContent>
    </Card>
  );
}
