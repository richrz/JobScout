'use client';

import Link from 'next/link';
import AuthStatus from '@/components/auth-status';
import { Button } from '@/components/ui/button';

const stats = [
  { label: 'Jobs Found', value: '127', change: '+12 today' },
  { label: 'Applications', value: '23', change: '5 pending' },
  { label: 'Interviews', value: '4', change: '2 this week' },
  { label: 'Match Score', value: '87%', change: 'Above average' },
];

const recentActivity = [
  { type: 'application', title: 'Applied to Senior Engineer at TechCorp', time: '2 hours ago' },
  { type: 'match', title: 'New high-match job: Full Stack Dev at StartupXYZ', time: '4 hours ago' },
  { type: 'interview', title: 'Interview scheduled with CloudStack', time: 'Yesterday' },
  { type: 'update', title: 'Resume updated with new skills', time: '2 days ago' },
];

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your job search overview.</p>
        </div>
        <AuthStatus />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border bg-card p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-3xl font-bold mt-2">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/jobs">
            <Button>🔍 Browse Jobs</Button>
          </Link>
          <Link href="/pipeline">
            <Button variant="outline">📋 View Pipeline</Button>
          </Link>
          <Link href="/settings">
            <Button variant="outline">⚙️ Settings</Button>
          </Link>
          <Button variant="outline">📄 Update Resume</Button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity.map((activity, i) => (
            <div key={i} className="flex items-start gap-3 pb-3 border-b last:border-0">
              <span className="text-xl">
                {activity.type === 'application' ? '📝' :
                  activity.type === 'match' ? '⭐' :
                    activity.type === 'interview' ? '🎯' : '🔄'}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.title}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Banner */}
      <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-center">
        <p className="text-sm">
          🚀 <strong>Pro tip:</strong> Set up your job sources in{' '}
          <Link href="/settings" className="text-primary underline">Settings</Link> to start receiving personalized job matches.
        </p>
      </div>
    </div>
  );
}
