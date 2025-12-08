import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // TODO: Get real user ID from session. For now, use the first user or mocked ID.
        // In a real app: const session = await getServerSession(authOptions);

        // Find the first user (assume single user mode for now)
        const user = await prisma.user.findFirst();

        if (!user) {
            return NextResponse.json({ error: 'No user found' }, { status: 404 });
        }

        let profile = await prisma.profile.findUnique({
            where: { userId: user.id },
        });

        if (!profile) {
            // Create empty profile if none exists
            profile = await prisma.profile.create({
                data: {
                    userId: user.id,
                    contactInfo: {},
                    workHistory: [],
                    education: [],
                    skills: [],
                    projects: [],
                    certifications: [],
                    preferences: {},
                },
            });
        }

        return NextResponse.json(profile);
    } catch (error) {
        console.error('Failed to fetching profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();

        const user = await prisma.user.findFirst();
        if (!user) {
            return NextResponse.json({ error: 'No user found' }, { status: 404 });
        }

        // Upsert profile
        const profile = await prisma.profile.upsert({
            where: { userId: user.id },
            update: {
                contactInfo: data.contactInfo || {},
                workHistory: data.workHistory || [],
                education: data.education || [],
                skills: data.skills || [],
                projects: data.projects || [],
                certifications: data.certifications || [],
                preferences: data.preferences || {},
                completeness: data.completeness || 0,
            },
            create: {
                userId: user.id,
                contactInfo: data.contactInfo || {},
                workHistory: data.workHistory || [],
                education: data.education || [],
                skills: data.skills || [],
                projects: data.projects || [],
                certifications: data.certifications || [],
                preferences: data.preferences || {},
                completeness: data.completeness || 0,
            },
        });

        return NextResponse.json(profile);
    } catch (error) {
        console.error('Failed to save profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
