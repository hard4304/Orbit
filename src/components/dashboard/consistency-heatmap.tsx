"use client";

interface HeatmapDay {
  date: string;
  count: number;
}

interface ConsistencyHeatmapProps {
  data: HeatmapDay[];
  maxCount?: number;
}

const DAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", "Sun"];

function getColor(count: number, max: number): string {
  if (count === 0) return "bg-muted/40";
  const ratio = count / Math.max(max, 1);
  if (ratio <= 0.25) return "bg-primary/20";
  if (ratio <= 0.5) return "bg-primary/40";
  if (ratio <= 0.75) return "bg-primary/60";
  return "bg-primary/90";
}

export function ConsistencyHeatmap({ data, maxCount }: ConsistencyHeatmapProps) {
  const max = maxCount ?? Math.max(...data.map((d) => d.count), 1);

  // Organize into weeks (columns) — 7 rows per column
  const weeks: HeatmapDay[][] = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        <div className="flex flex-col gap-1 mr-1">
          {DAY_LABELS.map((label, i) => (
            <div key={i} className="h-3.5 text-[10px] leading-[14px] text-muted-foreground">
              {label}
            </div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day) => (
              <div
                key={day.date}
                className={`h-3.5 w-3.5 rounded-sm ${getColor(day.count, max)}`}
                title={`${day.date}: ${day.count} habits`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
        <span>Less</span>
        <div className="h-3 w-3 rounded-sm bg-muted/40" />
        <div className="h-3 w-3 rounded-sm bg-primary/20" />
        <div className="h-3 w-3 rounded-sm bg-primary/40" />
        <div className="h-3 w-3 rounded-sm bg-primary/60" />
        <div className="h-3 w-3 rounded-sm bg-primary/90" />
        <span>More</span>
      </div>
    </div>
  );
}
