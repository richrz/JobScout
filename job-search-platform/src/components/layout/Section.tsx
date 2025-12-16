
import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    description?: string;
    children?: React.ReactNode;
    action?: React.ReactNode;
}

export function Section({
    title,
    description,
    children,
    action,
    className,
    ...props
}: SectionProps) {
    return (
        <section className={cn("space-y-6", className)} {...props}>
            {(title || description || action) && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        {title && (
                            <h2 className="text-title-section tracking-tight text-foreground">
                                {title}
                            </h2>
                        )}
                        {description && (
                            <p className="text-body-sm text-muted-foreground">
                                {description}
                            </p>
                        )}
                    </div>
                    {action && <div>{action}</div>}
                </div>
            )}
            {children && (
                <div className="space-y-4">
                    {children}
                </div>
            )}
        </section>
    );
}
