"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
    className?: string;
}

const Slider = React.forwardRef<
    React.ElementRef<typeof SliderPrimitive.Root>,
    SliderProps
>(({ className, defaultValue, value, ...props }, ref) => {
    // Count the number of thumbs needed based on value length
    const thumbCount = Array.isArray(defaultValue) ? defaultValue.length :
        Array.isArray(value) ? value.length : 1;

    const thumbStyle = "block h-6 w-6 rounded-full border-2 border-primary bg-background ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing shadow-lg hover:scale-110";

    return (
        <SliderPrimitive.Root
            ref={ref}
            defaultValue={defaultValue}
            value={value}
            className={cn(
                "relative flex w-full touch-none select-none items-center py-4",
                className
            )}
            {...props}
        >
            <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary cursor-pointer">
                <SliderPrimitive.Range className="absolute h-full bg-primary" />
            </SliderPrimitive.Track>
            {/* Render correct number of thumbs */}
            {Array.from({ length: thumbCount }).map((_, i) => (
                <SliderPrimitive.Thumb key={i} className={thumbStyle} />
            ))}
        </SliderPrimitive.Root>
    );
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
