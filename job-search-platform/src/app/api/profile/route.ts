import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const user = await prisma.user.findFirst();
        if (!user) {
            return NextResponse.json({ error: 'No user found' }, { status: 404 });
        }

        let profile = await prisma.profile.findUnique({
            where: { userId: user.id },
            include: { experiences: true, educations: true }
        });

        if (!profile) {
            profile = await prisma.profile.create({
                data: {
                    userId: user.id,
                    contactInfo: {},
                    workHistory: [],
                    experiences: { create: [] },
                    education: [],
                    educations: { create: [] },
                    skills: [],
                    projects: [],
                    certifications: [],
                    preferences: {},
                },
                include: { experiences: true, educations: true }
            });
        }

        revalidatePath('/resume');

        return NextResponse.json(profile);
    } catch (error) {
        console.error('Failed to fetching profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        // [TEMPORARY DEBUG] Prevent browser auto-save from overwriting seed data
        // return NextResponse.json({ message: "Update temporarily disabled for seeding" });


        const data = await request.json();
        const user = await prisma.user.findFirst();

        if (!user) {
            return NextResponse.json({ error: 'No user found' }, { status: 404 });
        }

        // Helper to parse dates
        const parseDate = (d: string) => d ? new Date(d) : undefined;

        // Upsert profile
        const profile = await prisma.profile.upsert({
            where: { userId: user.id },
            update: {
                contactInfo: data.contactInfo || {},
                // Sync legacy fields for now (optional)
                workHistory: [],
                education: [],

                // Update relations (Delete all and recreate strategy for simplicity)
                experiences: {
                    deleteMany: {},
                    create: (data.experiences || []).map((e: any) => ({
                        position: e.position,
                        company: e.company,
                        location: e.location,
                        startDate: e.startDate ? new Date(e.startDate) : new Date(),
                        endDate: e.endDate ? new Date(e.endDate) : null,
                        current: e.current || false,
                        description: e.description,
                        technologies: e.technologies || []
                    }))
                },
                educations: {
                    deleteMany: {},
                    create: (data.educations || []).map((e: any) => ({
                        school: e.school,
                        degree: e.degree,
                        field: e.field,
                        startDate: e.startDate ? new Date(e.startDate) : new Date(),
                        endDate: e.endDate ? new Date(e.endDate) : null,
                        description: e.description
                    }))
                },

                skills: data.skills || [],
                projects: data.projects || [],
                certifications: data.certifications || [],
                preferences: data.preferences || {},
                completeness: data.completeness || 0,
            },
            create: {
                userId: user.id,
                contactInfo: data.contactInfo || {},
                workHistory: [],
                education: [],

                experiences: {
                    create: (data.experiences || []).map((e: any) => ({
                        position: e.position,
                        company: e.company,
                        location: e.location,
                        startDate: e.startDate ? new Date(e.startDate) : new Date(),
                        endDate: e.endDate ? new Date(e.endDate) : null,
                        current: e.current || false,
                        description: e.description,
                        technologies: e.technologies || []
                    }))
                },
                educations: {
                    create: (data.educations || []).map((e: any) => ({
                        school: e.school,
                        degree: e.degree,
                        field: e.field,
                        startDate: e.startDate ? new Date(e.startDate) : new Date(),
                        endDate: e.endDate ? new Date(e.endDate) : null,
                        description: e.description
                    }))
                },

                skills: data.skills || [],
                projects: data.projects || [],
                certifications: data.certifications || [],
                preferences: data.preferences || {},
                completeness: data.completeness || 0,
            },
            include: { experiences: true, educations: true }
        });

        revalidatePath('/resume');

        return NextResponse.json(profile);
    } catch (error) {
        console.error('Failed to save profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
