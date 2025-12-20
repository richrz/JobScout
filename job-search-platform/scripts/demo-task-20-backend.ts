
import { prisma } from '../src/lib/prisma';
import { generateAndPreviewResume } from '../src/lib/resume-generator';
import { saveResume } from '../src/app/resume/actions';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

async function runDemo() {
    console.log('🚀 Starting Backend Demo for Task 20...');

    try {
        // 1. Get a Job
        const job = await prisma.job.findFirst();
        if (!job) {
            console.error('❌ No jobs found in database. Please seed DB first.');
            return;
        }
        console.log(`✅ Found Job: ${job.title} (${job.id})`);

        // 2. Get a Profile (ensure one exists)
        let profile = await prisma.profile.findFirst();
        if (!profile) {
            console.log('⚠️ No profile found. Creating a dummy profile...');
            // Need a user first
            let user = await prisma.user.findFirst();
            if (!user) {
                console.log('⚠️ No user found. Creating dummy user...');
                user = await prisma.user.create({
                    data: {
                        email: 'demo-user-' + Date.now() + '@example.com',
                        name: 'Demo User',
                        password: 'password123'
                    }
                });
            }
            profile = await prisma.profile.create({
                data: {
                    userId: user.id,
                    contactInfo: { name: 'Test Candidate', email: 'test@example.com' },
                    workHistory: [],
                    skills: ['React', 'TypeScript', 'Node.js'],
                    education: [],
                    projects: [],
                    certifications: [],
                    preferences: {}
                }
            });
        }
        console.log(`✅ Found/Created Profile for User: ${profile.userId}`);

        // 3. Generate Resume
        console.log('⏳ Generating Resume (Mocking LLM or using it if configured)...');
        // Note: verify if we are in Mock Mode or if keys are set
        // For this demo, we assume environment is set up.

        const result = await generateAndPreviewResume(job.id, 'professional');

        if (result.success) {
            console.log('✅ Resume Generated Successfully!');
            console.log('Summary Preview:', (result.content as any).summary?.substring(0, 100) + '...');
        } else {
            console.error('❌ Generation Failed:', result.error);
            // Don't stop, try save with dummy data
        }

        // 4. Test Persistence
        console.log('⏳ Testing Persistence...');
        const app = await prisma.application.findFirst({ where: { jobId: job.id } });
        let appId = app?.id;

        if (!appId) {
            console.log('Creating dummy application for persistence test...');
            const user = await prisma.user.findFirst();
            if (user) {
                const newApp = await prisma.application.create({
                    data: {
                        jobId: job.id,
                        userId: user.id,
                        status: 'draft'
                    }
                });
                appId = newApp.id;
            }
        }

        if (appId) {
            const dummyContent = { summary: 'This is a test resume content persisted via server action.' };
            const saveResult = await saveResume(appId, result.success ? result.content : dummyContent);

            if (saveResult.success) {
                console.log(`✅ Resume Saved to: ${saveResult.path}`);

                // Verify DB update
                const updatedApp = await prisma.application.findUnique({ where: { id: appId } });
                console.log(`✅ Application Record Updated: resumePath = ${updatedApp?.resumePath}`);
            } else {
                console.error('❌ Save Failed:', saveResult.error);
            }
        } else {
            console.warn('⚠️ Could not find/create application to test persistence.');
        }

    } catch (error) {
        console.error('❌ Demo Error:', error);
    }
}

runDemo();
