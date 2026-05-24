import { FaTimes } from 'react-icons/fa';
import type { FeatureAnnouncement } from '../constants/featureAnnouncements';

interface Props {
  feature: FeatureAnnouncement;
  onDismiss: () => void;
  onNavigate: () => void;
  isPending?: boolean;
}

export function FeatureAnnouncementBanner({
  feature,
  onDismiss,
  onNavigate,
  isPending,
}: Props) {
  const Icon = feature.icon;

  return (
    <button
      type="button"
      onClick={onNavigate}
      className="group w-full rounded-2xl border border-blue-400/40 bg-blue-500/10 px-4 py-3 text-left transition-colors hover:bg-blue-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-page"
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm shadow-black/10 ${feature.iconBg}`}
        >
          <Icon className="h-4 w-4" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-primary">{feature.title}</p>
          <p className="mt-0.5 text-xs text-subtle">{feature.description}</p>
        </div>

        <button
          type="button"
          aria-label="Đóng thông báo"
          disabled={isPending}
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="shrink-0 rounded-lg p-1.5 text-subtle transition-colors hover:bg-blue-500/20 hover:text-primary disabled:opacity-50"
        >
          <FaTimes className="h-3.5 w-3.5" />
        </button>
      </div>
    </button>
  );
}
