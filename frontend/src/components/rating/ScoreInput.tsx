import { cn } from "@/lib/utils"

interface ScoreInputProps {
  label: string
  description?: string
  value: number
  onChange: (value: number) => void
}

export function ScoreInput({ label, description, value, onChange }: ScoreInputProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <label className="text-sm font-medium">{label}</label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 11 }, (_, i) => i).map((score) => (
          <button
            key={score}
            type="button"
            onClick={() => onChange(score)}
            className={cn(
              "h-7 w-7 sm:h-9 sm:w-9 rounded-md text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              value === score
                ? "bg-primary text-primary-foreground"
                : "border bg-background text-foreground hover:bg-accent",
              score <= 3 && value !== score && "border-rose-200 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950",
              score >= 4 && score <= 6 && value !== score &&
                "border-amber-200 hover:bg-amber-50 dark:border-amber-900 dark:hover:bg-amber-950",
              score >= 7 && value !== score &&
                "border-emerald-200 hover:bg-emerald-50 dark:border-emerald-900 dark:hover:bg-emerald-950"
            )}
          >
            {score}
          </button>
        ))}
      </div>
    </div>
  )
}
