
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('☢️  NUCLEAR OPTION: Wiping all data...');

    // Delete in order to respect foreign keys
    await prisma.resume.deleteMany({});
    await prisma.application.deleteMany({});
    await prisma.education.deleteMany({});
    await prisma.workExperience.deleteMany({});
    await prisma.profile.deleteMany({});
    await prisma.config.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.account.deleteMany({});
    await prisma.user.deleteMany({});

    console.log('✅ Database wiped.');

    console.log('🌱 Creating new User...');
    const user = await prisma.user.create({
        data: {
            email: 'richard@piedpiper.com',
            name: 'Richard Hendricks',
            password: 'password123' // Dummy password
        }
    });

    console.log(`✅ User created: ${user.id}`);

    console.log('🌱 Creating Profile with "Pied Piper" data...');
    const profile = await prisma.profile.create({
        data: {
            userId: user.id,
            contactInfo: {
                name: 'Richard Hendricks',
                email: 'richard@piedpiper.com',
                phone: '+1 (555) 019-2834',
                location: 'Silicon Valley, CA',
                linkedin: 'linkedin.com/in/rhendricks',
                portfolio: 'piedpiper.com',
                summary: 'Passionate compression expert and full-stack engineer. Founder of Pied Piper. Creator of Middle-out compression.'
            },
            skills: ['C++', 'Algorithms', 'Compression', 'Distributed Systems', 'Leadership'],
            projects: [
                { name: "Middle-Out", description: "Revolutionary compression algorithm.", technologies: ["C++", "Math"], url: "github.com/middle-out" },
                { name: "PiperNet", description: "Decentralized internet.", technologies: ["P2P", "Networking"], url: "pipernet.io" }
            ],
            certifications: [
                { name: "TechCrunch Disrupt Winner", issuer: "TechCrunch", date: "2014-09-01", url: "" }
            ],
            // Legacy fields empty
            workHistory: [],
            education: [],

            // Exact relations
            experiences: {
                create: [
                    {
                        company: 'Pied Piper',
                        position: 'CEO & Founder',
                        location: 'Palo Alto, CA',
                        startDate: new Date('2014-04-01'),
                        endDate: new Date('2019-12-01'),
                        current: false,
                        description: 'Founded and led a deep-tech startup focused on middle-out compression algorithms. \n- Achieved a Weissman Score of 5.2. \n- Secured Series B funding.',
                        technologies: ['C++', 'Compression', 'System Design']
                    },
                    {
                        company: 'Hooli',
                        position: 'Software Engineer II',
                        location: 'Mountain View, CA',
                        startDate: new Date('2012-06-01'),
                        endDate: new Date('2014-03-30'),
                        current: false,
                        description: 'Developed backend services for Hooli XYZ. \n- Optimized search indexing algorithms.',
                        technologies: ['Java', 'MapReduce', 'HooliSQL']
                    }
                ]
            },
            educations: {
                create: [
                    {
                        school: 'Stanford University',
                        degree: 'B.S. Computer Science',
                        field: 'Computer Science',
                        startDate: new Date('2008-09-01'),
                        endDate: new Date('2012-06-01'),
                        description: 'Focus on AI and Compression. GPA: 4.0.'
                    }
                ]
            },
            preferences: {},
            completeness: 100
        }
    });

    console.log(`✅ Profile created: ${profile.id}`);

    // IMMEDIATE VERIFICATION
    const verify = await prisma.profile.findUnique({
        where: { id: profile.id },
        include: { experiences: true }
    });
    console.log('🧐 VERIFICATION READ:', JSON.stringify(verify, null, 2));

    console.log('🎉 FORCE SEED COMPLETE. The database now contains EXACTLY ONE user and profile.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
