import type { CSSProperties } from "react";
import { CLOSE, OPEN, dateString, timeString } from "../../domain/booking";
import "./CurrentTimeLine.css";
export function CurrentTimeLine({ date, now }: { date: string; now: Date }) {
  const minute = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  if (date !== dateString(now) || minute < OPEN || minute > CLOSE) return null;
  const time = timeString(Math.floor(minute));
  return (
    <div
      className="now-line"
      style={
        {
          "--now": `${((minute - OPEN) / (CLOSE - OPEN)) * 100}%`,
        } as CSSProperties
      }
      aria-label={`Current time ${time}`}
    >
      <span>{time}</span>
    </div>
  );
}
