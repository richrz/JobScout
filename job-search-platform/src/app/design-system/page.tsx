import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DesignSystemPage() {
    return (
        <div className="min-h-screen bg-background p-10 text-foreground space-y-10">
            <section>
                <h1 className="text-4xl font-bold mb-4">Design System Showcase</h1>
                <p className="text-muted-foreground text-lg">
                    A preview of the JobScout modern dark theme and component library.
                </p>
            </section>

            <section className="space-y-6">
                <h2 className="text-2xl font-semibold border-b pb-2">Color Palette & Accents</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <Card className="border-l-4 border-l-[hsl(var(--chart-1))]">
                        <CardHeader>
                            <CardTitle className="text-[hsl(var(--chart-1))]">Jobs Found</CardTitle>
                            <CardDescription>Primary Action / Alert</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-10 w-full rounded bg-[hsl(var(--chart-1))] opacity-20 flex items-center justify-center text-[hsl(var(--chart-1))] font-bold">
                                Orange
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-[hsl(var(--chart-2))]">
                        <CardHeader>
                            <CardTitle className="text-[hsl(var(--chart-2))]">Applications</CardTitle>
                            <CardDescription>Info / Primary Brand</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-10 w-full rounded bg-[hsl(var(--chart-2))] opacity-20 flex items-center justify-center text-[hsl(var(--chart-2))] font-bold">
                                Blue
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-[hsl(var(--chart-3))]">
                        <CardHeader>
                            <CardTitle className="text-[hsl(var(--chart-3))]">Interviews</CardTitle>
                            <CardDescription>Success / Growth</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-10 w-full rounded bg-[hsl(var(--chart-3))] opacity-20 flex items-center justify-center text-[hsl(var(--chart-3))] font-bold">
                                Green
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-[hsl(var(--chart-4))]">
                        <CardHeader>
                            <CardTitle className="text-[hsl(var(--chart-4))]">Match Score</CardTitle>
                            <CardDescription>Warning / Rating</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-10 w-full rounded bg-[hsl(var(--chart-4))] opacity-20 flex items-center justify-center text-[hsl(var(--chart-4))] font-bold">
                                Yellow
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <section className="space-y-6">
                <h2 className="text-2xl font-semibold border-b pb-2">UI Components</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Standard Card</CardTitle>
                            <CardDescription>Default background and border.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>This uses the default <code className="bg-muted p-1 rounded">bg-card</code> and <code className="bg-muted p-1 rounded">text-card-foreground</code>.</p>
                            <div className="mt-4 flex gap-4">
                                <Button>Primary Button</Button>
                                <Button variant="secondary">Secondary Button</Button>
                                <Button variant="outline">Outline Button</Button>
                                <Button variant="destructive">Destructive</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass border-primary/20">
                        <CardHeader>
                            <CardTitle>Glass Card</CardTitle>
                            <CardDescription>Using the custom <code className="text-primary">.glass</code> utility.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>This adds transparent background and backdrop blur for valid environments.</p>
                            <div className="mt-4">
                                <div className="h-2 w-full bg-secondary rounded overflow-hidden">
                                    <div className="h-full bg-primary w-[70%]"></div>
                                </div>
                                <p className="text-xs text-right mt-1 text-muted-foreground">Progress: 70%</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <section className="space-y-6">
                <h2 className="text-2xl font-semibold border-b pb-2">Typography & Gradients</h2>
                <div className="space-y-4">
                    <h1 className="text-5xl font-extrabold tracking-tight">Big Heading</h1>
                    <h2 className="text-3xl font-bold tracking-tight text-gradient">Gradient Text Heading</h2>
                    <p className="leading-7 [&:not(:first-child)]:mt-6 max-w-2xl">
                        This design system prioritizes readability and visual hierarchy. colors are chosen to reduce eye strain in
                        dark environments while maintaining vibrant accents for key data points.
                    </p>
                </div>
            </section>
        </div>
    );
}
