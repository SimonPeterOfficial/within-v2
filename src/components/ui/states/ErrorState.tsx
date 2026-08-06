import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import StatePanel from "@/components/ui/states/StatePanel";

type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
};

/** Graceful failure — announced via the alert role, retry built in. */
export default function ErrorState({
  title = "Something drifted off course",
  description = "The light usually returns — try once more.",
  onRetry,
  className = ""
}: ErrorStateProps) {
  return (
    <div role="alert">
      <StatePanel
        className={className}
        icon={<Icon name="alert" size={26} className="text-rose-400" />}
        title={title}
        description={description}
        action={
          onRetry ? (
            <Button variant="outline" size="sm" onClick={onRetry}>
              Try again
            </Button>
          ) : undefined
        }
      />
    </div>
  );
}
