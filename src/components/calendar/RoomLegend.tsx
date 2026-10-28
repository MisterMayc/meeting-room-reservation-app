import { Plus } from "lucide-react";
import { ROOMS } from "../../domain/booking";
import "./RoomLegend.css";
export function RoomLegend() {
  const items = [...ROOMS, { id: "ended", name: "Ended", color: "#a4adba" }];
  return (
    <div className="room-legend">
      <div>
        {items.map((room) => (
          <span key={room.id}>
            <i style={{ background: room.color }} />
            {room.name}
          </span>
        ))}
      </div>
      <p>
        <Plus size={16} />
        Select an open time to reserve
      </p>
    </div>
  );
}
