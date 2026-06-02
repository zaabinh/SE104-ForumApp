'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import { ReportReason } from '@/lib/forumApi';

type ReportDialogProps = {
  targetLabel: string;
  open: boolean;
  loading?: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (payload: { reason: ReportReason; details?: string }) => Promise<void>;
};

const reportReasons: Array<{ value: ReportReason; label: string; description: string }> = [
  { value: 'spam', label: 'Spam', description: 'Quảng cáo, lặp nội dung hoặc gây nhiễu cộng đồng.' },
  { value: 'harassment', label: 'Quấy rối', description: 'Công kích cá nhân, xúc phạm hoặc bắt nạt.' },
  { value: 'hate_speech', label: 'Thù ghét', description: 'Nội dung phân biệt hoặc kích động thù ghét.' },
  { value: 'violence', label: 'Bạo lực', description: 'Đe dọa, cổ vũ hoặc mô tả bạo lực không phù hợp.' },
  { value: 'misinformation', label: 'Sai lệch', description: 'Thông tin sai sự thật hoặc dễ gây hiểu nhầm.' },
  { value: 'other', label: 'Khác', description: 'Vấn đề khác cần admin xem xét.' },
];

export default function ReportDialog({ targetLabel, open, loading = false, error = '', onClose, onSubmit }: ReportDialogProps) {
  const [reason, setReason] = useState<ReportReason>('spam');
  const [details, setDetails] = useState('');

  if (!open || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-ink-900/50 px-3 py-5 backdrop-blur-sm sm:px-4"
      onClick={(event) => {
        event.stopPropagation();
        if (!loading) onClose();
      }}
    >
      <section
        className="my-auto flex max-h-[calc(100dvh-2.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-[24px] border border-white/70 bg-white shadow-dashboard sm:rounded-[28px]"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-rose-50 to-white px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex min-w-0 gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 sm:h-11 sm:w-11">
              <FiAlertTriangle className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-ink-900 sm:text-lg">Báo cáo {targetLabel}</h2>
              <p className="mt-1 text-sm leading-6 text-ink-500">
                Admin sẽ xem xét báo cáo này. Vui lòng chọn lý do rõ ràng để xử lý nhanh hơn.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="shrink-0 rounded-full border border-slate-200 p-2 text-ink-500 transition hover:border-rose-200 hover:text-rose-600 disabled:opacity-50"
            aria-label="Đóng báo cáo"
          >
            <FiX className="h-4 w-4" />
          </button>
        </header>

        <form
          className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5"
          onSubmit={async (event) => {
            event.preventDefault();
            await onSubmit({ reason, details: details.trim() || undefined });
            setReason('spam');
            setDetails('');
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {reportReasons.map((item) => (
              <label
                key={item.value}
                className={`cursor-pointer rounded-2xl border p-3 transition sm:p-4 ${
                  reason === item.value ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-slate-200 bg-white text-ink-600 hover:border-rose-200'
                }`}
              >
                <input
                  type="radio"
                  name="report-reason"
                  value={item.value}
                  checked={reason === item.value}
                  onChange={() => setReason(item.value)}
                  className="sr-only"
                />
                <span className="text-sm font-semibold">{item.label}</span>
                <span className="mt-1 block text-xs leading-5 text-ink-500">{item.description}</span>
              </label>
            ))}
          </div>

          <label className="mt-5 block space-y-2">
            <span className="text-sm font-semibold text-ink-700">Chi tiết bổ sung</span>
            <textarea
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              maxLength={2000}
              placeholder="Mô tả ngắn vấn đề nếu cần..."
              className="min-h-24 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink-700 outline-none transition focus:border-rose-300 focus:bg-white sm:min-h-28"
            />
            <span className="block text-right text-xs text-ink-400">{details.length}/2000</span>
          </label>

          {error ? <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">{error}</p> : null}

          <div className="sticky bottom-0 -mx-4 mt-5 flex flex-col-reverse gap-3 border-t border-slate-100 bg-white/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-ink-600 transition hover:border-slate-300 hover:text-ink-900 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Đang gửi...' : 'Gửi báo cáo'}
            </button>
          </div>
        </form>
      </section>
    </div>,
    document.body
  );
}
