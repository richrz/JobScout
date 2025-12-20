"use client";

import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";

interface ScoreRadialProps {
    score: number; // 0-100
    size?: number;
    className?: string;
}

export function ScoreRadial({ score, size = 44, className }: ScoreRadialProps) {
    // Color based on score - semantic colors
    const fill = score >= 80 ? "hsl(142 76% 36%)" // emerald-600
        : score >= 60 ? "hsl(45 93% 47%)" // amber-500
            : "hsl(0 84% 60%)"; // rose-500

    const data = [{ value: score, fill }];

    return (
        <div className={className} style={{ width: size, height: size }}>
            <RadialBarChart
                width={size}
                height={size}
                cx={size / 2}
                cy={size / 2}
                innerRadius={size * 0.35}
                outerRadius={size * 0.48}
                data={data}
                startAngle={90}
                endAngle={-270}
                barSize={size * 0.15}
            >
                <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    angleAxisId={0}
                    tick={false}
                />
                <RadialBar
                    background={{ fill: "hsl(var(--muted))" }}
                    dataKey="value"
                    cornerRadius={size * 0.1}
                    angleAxisId={0}
                />
                <text
                    x={size / 2}
                    y={size / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-foreground text-[10px] font-bold"
                >
                    {score}%
                </text>
            </RadialBarChart>
        </div>
    );
}
