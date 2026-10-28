import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";
import "./Modal.css";

interface Props {
  title: string;
  description: string;
  children: ReactNode;
  pending?: boolean;
  onClose: () => void;
}

export function Modal({
  title,
  description,
  children,
  pending,
  onClose,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    dialog?.querySelector<HTMLInputElement>("input:not(:disabled)")?.focus();
    return () => dialog?.close();
  }, []);
  const close = () => {
    if (!pending) onClose();
  };
  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <header className="modal__header">
        <div>
          <h2 id="dialog-title">{title}</h2>
          <p>{description}</p>
        </div>
        <Button
          variant="icon"
          aria-label="Close reservation"
          disabled={pending}
          onClick={close}
        >
          <X />
        </Button>
      </header>
      {children}
    </dialog>
  );
}
