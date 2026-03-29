'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { AlertTriangle, Info, AlertCircle, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const premiumAlertVariants = cva(
    "relative w-full max-w-xl mx-auto overflow-hidden rounded-xl border p-3 shadow-md transition-all animate-in fade-in slide-in-from-top-[6px] duration-500",
    {
        variants: {
            variant: {
                critical: "border-red-500/20 bg-red-500/5 text-red-600",
                warning: "border-amber-500/20 bg-amber-500/5 text-amber-600",
                info: "border-blue-500/20 bg-blue-500/5 text-blue-600",
            },
        },
        defaultVariants: {
            variant: "info",
        },
    }
);

interface PremiumAlertProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof premiumAlertVariants> {
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    onClose?: () => void;
}

const icons = {
    critical: AlertTriangle,
    warning: AlertCircle,
    info: Info,
};

export function PremiumAlert({
    className,
    variant = 'info',
    title,
    description,
    actionLabel,
    onAction,
    onClose,
    ...props
}: PremiumAlertProps) {
    const Icon = icons[variant || 'info'];

    return (
        <div className={cn(premiumAlertVariants({ variant }), className)} {...props}>
            <div className="flex items-start gap-4">
                <div className={cn(
                    "mt-0.5 rounded-full p-1.5",
                    variant === 'critical' && "bg-red-500/10",
                    variant === 'warning' && "bg-amber-500/10",
                    variant === 'info' && "bg-blue-500/10",
                )}>
                    <Icon className="h-4 w-4" />
                </div>

                <div className="flex-1 space-y-1">
                    <h3 className="text-sm font-semibold leading-none tracking-tight">
                        {title}
                    </h3>
                    {description && (
                        <p className="text-xs text-muted-foreground whitespace-normal">
                            {description}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {actionLabel && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "h-7 px-2 text-xs font-medium hover:bg-transparent transition-colors",
                                variant === 'critical' && "text-red-600 hover:text-red-700",
                                variant === 'warning' && "text-amber-600 hover:text-amber-700",
                                variant === 'info' && "text-blue-600 hover:text-blue-700",
                            )}
                            onClick={onAction}
                        >
                            {actionLabel}
                            <ChevronRight className="ml-0.5 h-3 w-3" />
                        </Button>
                    )}

                    {onClose && (
                        <button
                            onClick={onClose}
                            className="rounded-full p-1 opacity-60 hover:opacity-100 transition-opacity"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Decorative Glow */}
            <div className={cn(
                "absolute -left-12 -top-12 h-24 w-24 rounded-full blur-2xl opacity-10",
                variant === 'critical' && "bg-red-500",
                variant === 'warning' && "bg-amber-500",
                variant === 'info' && "bg-blue-500",
            )} />
        </div>
    );
}
