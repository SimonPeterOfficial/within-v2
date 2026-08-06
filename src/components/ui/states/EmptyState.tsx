import Icon, { type IconName } from "@/components/ui/Icon";
import StatePanel from "@/components/ui/states/StatePanel";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: IconName;
  className?: string;
};

/** Quiet emptiness — for zero-result lists, empty feeds, and blank slates. */
export default function EmptyState({
  title,
  description,
  action,
  icon = "inbox",
  className = ""
}: EmptyStateProps) {
  return (
    <StatePanel
      className={className}
      icon={<Icon name={icon} size={26} className="text-ink-muted" />}
      title={title}
      description={description}
      action={action}
    />
  );
}
