
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/glass-card";

interface ShellCardProps {
    title?: React.ReactNode;
    description?: React.ReactNode;
    action?: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
    variant?: "default" | "highlight" | "interactive";
    glowColor?: string;
}

export function ShellCard({
    title,
    description,
    action,
    children,
    footer,
    className,
    variant,
    glowColor,
}: ShellCardProps) {
    return (
        <GlassCard
            className={cn("flex flex-col", className)}
            variant={variant}
            glowColor={glowColor}
            hoverEffect={!!variant && variant === 'interactive'}
        >
            {/* Header */}
            {(title || description || action) && (
                <div className="p-card pb-2 space-y-1.5 border-b border-transparent">
                    <div className="flex items-center justify-between gap-4">
                        {title && (
                            <h3 className="text-title-subsection leading-none tracking-tight">
                                {title}
                            </h3>
                        )}
                        {action && <div className="shrink-0">{action}</div>}
                    </div>
                    {description && (
                        <p className="text-body-sm text-muted-foreground leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>
            )}

            {/* Body */}
            <div className={cn("p-card", (title || description) && "pt-4")}>
                {children}
            </div>

            {/* Footer */}
            {footer && (
                <div className="p-card pt-0 mt-auto flex items-center">
                    {footer}
                </div>
            )}
        </GlassCard>
    );
}
