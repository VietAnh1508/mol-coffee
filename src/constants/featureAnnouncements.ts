import type { IconType } from 'react-icons';
import { FaClipboardList } from 'react-icons/fa';

export interface FeatureAnnouncement {
  key: string;
  title: string;
  description: string;
  to: string;
  icon: IconType;
  iconBg: string;
}

// Keys are written to the DB. Never rename or recycle a key once it has been used.
// Removing an entry is safe — existing DB rows are simply ignored.
export const FEATURE_ANNOUNCEMENTS: readonly FeatureAnnouncement[] = [
  {
    key: 'shift-registration-2026',
    title: 'Đăng ký ca trực tuyến',
    description: 'Bạn có thể đăng ký ca làm việc trực tiếp trên ứng dụng.',
    to: '/shift-registration',
    icon: FaClipboardList,
    iconBg: 'bg-teal-500',
  },
];
