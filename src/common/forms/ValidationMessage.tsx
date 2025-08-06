'use client';

import { ExclamationCircleIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface Props {
  type: 'error' | 'warning' | 'success' | 'info';
  message: string;
  suggestion?: string;
  className?: string;
}

export function ValidationMessage({ type, message, suggestion, className = '' }: Props) {
  const getStyles = () => {
    switch (type) {
      case 'error':
        return {
          container: 'bg-red-50 border-red-200 text-red-800',
          icon: 'text-red-400',
          IconComponent: ExclamationCircleIcon
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          icon: 'text-yellow-400',
          IconComponent: ExclamationTriangleIcon
        };
      case 'success':
        return {
          container: 'bg-green-50 border-green-200 text-green-800',
          icon: 'text-green-400',
          IconComponent: CheckCircleIcon
        };
      case 'info':
      default:
        return {
          container: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: 'text-blue-400',
          IconComponent: ExclamationCircleIcon
        };
    }
  };

  const styles = getStyles();
  const { IconComponent } = styles;

  return (
    <div className={`border rounded-md p-3 ${styles.container} ${className}`}>
      <div className="flex items-start space-x-2">
        <IconComponent className={`h-4 w-4 mt-0.5 flex-shrink-0 ${styles.icon}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{message}</p>
          {suggestion && (
            <p className="text-xs mt-1 opacity-80">{suggestion}</p>
          )}
        </div>
      </div>
    </div>
  );
} 