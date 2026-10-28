import type { ReactNode } from "react";
import "./FormField.css";

export function FormField({
  id,
  label,
  optional,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="form-field">
      <label htmlFor={id}>
        {label}
        {optional && <span>Optional</span>}
      </label>
      {children}
    </div>
  );
}
