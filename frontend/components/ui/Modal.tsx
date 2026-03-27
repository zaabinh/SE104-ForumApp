type ModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function Modal({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-all duration-200 hover:border-slate-300 hover:text-slate-900"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-2xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-rose-600"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
