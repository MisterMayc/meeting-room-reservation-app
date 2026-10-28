import type { CSSProperties } from "react";
import { CLOSE, OPEN, timeString } from "../../domain/booking";
import "./TimeAxis.css";
const hours = Array.from(
  { length: (CLOSE - OPEN) / 60 + 1 },
  (_, index) => OPEN + index * 60,
);
export function TimeAxis() {
  return (
    <div className="time-axis" aria-hidden="true">
      {hours.map((hour) => (
        <span
          key={hour}
          style={
            {
              "--position": `${((hour - OPEN) / (CLOSE - OPEN)) * 100}%`,
            } as CSSProperties
          }
        >
          {timeString(hour)}
        </span>
      ))}
    </div>
  );
}
