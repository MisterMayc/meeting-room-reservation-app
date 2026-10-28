import { PageLayout } from "./components/layout/PageLayout";
import { PageHeading } from "./components/layout/PageHeading";
import { DayOverview } from "./components/overview/DayOverview";
import { SchedulePanel } from "./components/calendar/SchedulePanel";
import { ReservationDialog } from "./components/reservation/ReservationDialog";
import { Toast } from "./components/ui/Toast";
import { useConflictSimulation } from "./hooks/useConflictSimulation";
import { useCalendarPage } from "./hooks/useCalendarPage";
import "./App.css";
export default function App() {
  const page = useCalendarPage();
  const simulation = useConflictSimulation();
  return (
    <PageLayout>
      <PageHeading
        disabled={page.status !== "ready" || simulation.pending}
        onCreate={page.create}
        simulation={simulation}
      />
      <DayOverview bookings={page.daily} now={page.now} />
      <SchedulePanel
        date={page.date}
        now={page.now}
        bookings={page.daily}
        status={page.status}
        error={page.error}
        onSelect={page.setDate}
        onMove={page.moveDate}
        onCreate={page.createAt}
        onEdit={page.edit}
        onRetry={page.retry}
      />
      <p className="demo-note">Demo data · October–November 2026</p>
      {page.notice && (
        <Toast message={page.notice} onDismiss={page.dismissNotice} />
      )}{" "}
      {page.reservation && (
        <ReservationDialog
          initial={page.reservation.draft}
          booking={page.reservation.booking}
          bookings={page.bookings}
          now={page.now}
          refresh={page.refresh}
          onClose={page.close}
          onSaved={page.setNotice}
          onCreateAttempt={simulation.refresh}
        />
      )}
    </PageLayout>
  );
}
