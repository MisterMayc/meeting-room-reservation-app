import "./ConflictSwitch.css";
interface Props {
  checked: boolean;
  pending: boolean;
  disabled?: boolean;
  error?: string;
  onChange: () => void;
}
export function ConflictSwitch({
  checked,
  pending,
  disabled,
  error,
  onChange,
}: Props) {
  return (
    <div className="conflict-control">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label="Simulate conflict on next new reservation"
        aria-describedby="conflict-switch-help"
        disabled={disabled || pending}
        className={`conflict-switch ${checked ? "conflict-switch--on" : ""}`}
        onClick={onChange}
      >
        <span className="conflict-switch__track" aria-hidden="true">
          <span />
        </span>
        <span>Simulate conflict</span>
      </button>
      <p id="conflict-switch-help">
        {pending
          ? "Updating…"
          : checked
            ? "Next new reservation will return 409"
            : "Next new reservation only"}
      </p>
      {error && (
        <p className="conflict-control__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
