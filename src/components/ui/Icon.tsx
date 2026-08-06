import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Compass,
  Eye,
  EyeOff,
  Film,
  Home,
  Inbox,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Menu,
  Moon,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Sun,
  User,
  X
} from "lucide-react";

/**
 * The icon system — one canonical registry instead of scattered lucide
 * imports. New surfaces pick an `IconName`; nothing reaches into the icon
 * library directly, so swapping icon sets later touches a single file.
 */
export const icons = {
  home: Home,
  discover: Compass,
  stories: BookOpen,
  originals: Film,
  profile: User,
  logout: LogOut,
  moon: Moon,
  sun: Sun,
  menu: Menu,
  close: X,
  back: ArrowLeft,
  forward: ArrowRight,
  check: Check,
  alert: AlertCircle,
  loader: Loader2,
  mail: Mail,
  lock: Lock,
  sparkles: Sparkles,
  inbox: Inbox,
  refresh: RefreshCw,
  eye: Eye,
  eyeOff: EyeOff,
  search: Search,
  plus: Plus,
  chevronRight: ChevronRight,
  chevronLeft: ChevronLeft
} as const;

export type IconName = keyof typeof icons;

type IconProps = {
  name: IconName;
  className?: string;
  size?: number;
  strokeWidth?: number;
};

/** System icons are decorative by default — pair with adjacent text/labels. */
export default function Icon({ name, className = "", size = 18, strokeWidth = 2 }: IconProps) {
  const LucideIcon = icons[name];
  return <LucideIcon className={className} size={size} strokeWidth={strokeWidth} aria-hidden="true" />;
}
