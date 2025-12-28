
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, CreditCard, Bell } from 'lucide-react';

export function AccountSettings() {
    return (
        <div className="space-y-6">
            <Card className="bg-card border-border">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle>Security & Authentication</CardTitle>
                            <CardDescription>Manage your login credentials and security sessions.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" defaultValue="richard@example.com" disabled />
                        <p className="text-xs text-muted-foreground">Managed via Google OAuth</p>
                    </div>
                    <div className="pt-2">
                        <Button variant="outline" className="w-full sm:w-auto">Change Password</Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <CardTitle>Billing & Subscription</CardTitle>
                            <CardDescription>View your plan and payment methods.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-background/50">
                        <div>
                            <p className="font-medium text-foreground">Pro Plan</p>
                            <p className="text-sm text-muted-foreground">$29/month • Active</p>
                        </div>
                        <Button variant="secondary" size="sm">Manage Subscription</Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                            <Bell className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                            <CardTitle>Notifications</CardTitle>
                            <CardDescription>Configure how you receive alerts.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Placeholder for notification toggles */}
                    <p className="text-sm text-muted-foreground">Notification settings coming soon.</p>
                </CardContent>
            </Card>
        </div>
    );
}
