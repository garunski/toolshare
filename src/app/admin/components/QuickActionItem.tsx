import { PlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

interface QuickAction {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
}

interface QuickActionItemProps {
  action: QuickAction;
}

export function QuickActionItem({ action }: QuickActionItemProps) {
  const Icon = action.icon;

  return (
    <Link
      href={action.href}
      className={`flex items-center space-x-3 rounded-lg p-3 transition-colors ${action.color}`}
    >
      <Icon className="h-5 w-5" />
      <div className="flex-1">
        <div className="font-medium">{action.title}</div>
        <div className="text-sm opacity-75">{action.description}</div>
      </div>
      <PlusIcon className="h-4 w-4 opacity-50" />
    </Link>
  );
} 