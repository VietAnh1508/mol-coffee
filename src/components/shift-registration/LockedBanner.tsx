interface Props {
  lockedByName?: string | null;
}

export function LockedBanner({ lockedByName }: Props) {
  return (
    <div className="rounded-2xl border border-amber-400/40 bg-amber-500/10 px-4 py-3">
      <p className="text-sm font-semibold text-amber-700">
        Bảng đăng ký đã bị khoá
      </p>
      {lockedByName && (
        <p className="mt-0.5 text-xs text-amber-600">Khoá bởi {lockedByName}</p>
      )}
    </div>
  );
}
