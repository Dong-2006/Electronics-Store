import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";
import { Modal } from "./Modal";

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  variant = "danger",
  isLoading,
  onClose,
  onConfirm
}: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>{cancelLabel}</Button>
          <Button variant={variant === "danger" ? "danger" : "primary"} isLoading={isLoading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-red-50 text-red-600">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <p className="text-sm leading-6 text-slate-600">{description}</p>
      </div>
    </Modal>
  );
}
