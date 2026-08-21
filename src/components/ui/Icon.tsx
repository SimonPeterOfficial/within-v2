import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Book,
  BookOpen,
  Bookmark,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  Eye,
  EyeOff,
  Film,
  Flag,
  Headphones,
  Heart,
  Home,
  Inbox,
  LayoutDashboard,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Menu,
  Mic,
  Moon,
  Music,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Star,
  Sun,
  User,
  Users,
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
  chevronLeft: ChevronLeft,
  /* ── Home experience ── */
  music: Music,
  headphones: Headphones,
  play: Play,
  pause: Pause,
  camera: Camera,
  users: Users,
  heart: Heart,
  clock: Clock,
  book: Book,
  /* ── Universe ── */
  settings: Settings,
  star: Star,
  bookmark: Bookmark,
  sliders: SlidersHorizontal,
  /* ── Admin ── */
  dashboard: LayoutDashboard,
  shield: Shield,
  flag: Flag,
  analytics: BarChart3,
  /* ── Auri ── */
  mic: Mic,
  send: Send
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
