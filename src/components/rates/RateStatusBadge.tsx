export type RateStatus = 'active' | 'future' | 'expired';

export function RateStatusBadge({ status }: { status: RateStatus }) {
  if (status === 'active')
    return (
      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
        Đang áp dụng
      </span>
    );
  if (status === 'future')
    return (
      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
        Sắp áp dụng
      </span>
    );
  return (
    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
      Đã hết hạn
    </span>
  );
}
