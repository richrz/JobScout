
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
                "w-full mx-auto py-page space-y-section",
                width === "default" && "max-w-7xl px-4 md:px-8",
                width === "wide" && "max-w-[1600px] px-4 md:px-8",
                width === "full" && "max-w-none px-0",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
