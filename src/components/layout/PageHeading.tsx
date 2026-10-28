import { ConflictSwitch } from "../ui/ConflictSwitch";
import type { useConflictSimulation } from "../../hooks/useConflictSimulation";
import { Plus } from "lucide-react";
import { Button } from "../ui/Button";
import "./PageHeading.css";
export function PageHeading({
  disabled,
  onCreate,
  simulation,
}: {
  disabled: boolean;
  onCreate: () => void;
  simulation: ReturnType<typeof useConflictSimulation>;
}) {
  return (
    <section className="page-heading">
      <div className="page-heading__intro">
        <h1>Room reservations</h1>
        <p>Find a room and make time for your next meeting.</p>
      </div>
      <div className="page-heading__actions">
        <ConflictSwitch
          checked={simulation.armed}
          pending={simulation.pending}
          error={simulation.error}
          disabled={disabled && !simulation.pending}
          onChange={simulation.toggle}
        />
        <Button
          id="new-reservation"
          variant="primary"
          disabled={disabled}
          onClick={onCreate}
        >
          <Plus />
          New reservation
        </Button>
      </div>
    </section>
  );
}
