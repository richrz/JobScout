
import { cn } from "@/lib/utils";

interface PageProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    width?: "default" | "wide" | "full";
}

export function Page({
    children,
    width = "default",
    className,
    ...props
}: PageProps) {
    return (
        <div
            className={cn(
                "w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8",
                width === "default" && "max-w-7xl",
                width === "wide" && "max-w-[1600px]",
                width === "full" && "max-w-none",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
