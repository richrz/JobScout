
import { prisma } from '../src/lib/prisma';
import { Prisma } from '@prisma/client';

const personas = [
    {
        name: 'Richard Hendricks',
        contact: {
            name: 'Richard Hendricks',
            email: 'richard@piedpiper.com',
            phone: '+1 (555) 019-2834',
            location: 'Silicon Valley, CA',
            linkedin: 'linkedin.com/in/rhendricks',
            portfolio: 'piedpiper.com',
            summary: 'Passionate compression expert and full-stack engineer. Founder of Pied Piper. Creator of Middle-out compression.'
        },
        experiences: [
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
        ],
        education: [
            {
                school: 'Stanford University',
                degree: 'B.S. Computer Science',
                field: 'Computer Science',
                startDate: new Date('2008-09-01'),
                endDate: new Date('2012-06-01'),
                description: 'Focus on AI and Compression. GPA: 4.0.'
            }
        ],
        skills: ['C++', 'Algorithms', 'Compression', 'Distributed Systems', 'Leadership'],
        projects: [
            { name: "Middle-Out", description: "Revolutionary compression algorithm.", technologies: ["C++", "Math"], url: "github.com/middle-out" },
            { name: "PiperNet", description: "Decentralized internet.", technologies: ["P2P", "Networking"], url: "pipernet.io" }
        ],
        certifications: [
            { name: "TechCrunch Disrupt Winner", issuer: "TechCrunch", date: "2014-09-01", url: "" }
        ]
    }
];

async function main() {
    // 1. Select Persona
    const persona = personas[0]; // Strict mode: enforce Richard for verification first
    console.log(`Seeding profile for: ${persona.name}`);

    // 2. Find or Create User
    const user = await prisma.user.findFirst();
    if (!user) {
        console.error('No user found to attach profile to.');
        return;
    }

    // 3. Upsert Profile (Create if not exists, Update if exists)
    // We do this in a transaction to be safe with relations

    // First, find the profile ID if it exists
    const existingProfile = await prisma.profile.findUnique({ where: { userId: user.id } });

    if (existingProfile) {
        console.log('Found existing profile, wiping relations and updating...');

        await prisma.$transaction([
            // Clear existing relations
            prisma.workExperience.deleteMany({ where: { profileId: existingProfile.id } }),
            prisma.education.deleteMany({ where: { profileId: existingProfile.id } }),

            // Update scalar/JSON fields and User name
            prisma.user.update({
                where: { id: user.id },
                data: { name: persona.name }
            }),
            prisma.profile.update({
                where: { id: existingProfile.id },
                data: {
                    contactInfo: persona.contact, // Json field
                    skills: persona.skills,
                    projects: persona.projects, // Json field
                    certifications: persona.certifications, // Json field
                    workHistory: [], // legacy clear
                    education: [], // legacy clear
                    completeness: 100,
                    experiences: {
                        create: persona.experiences
                    },
                    educations: {
                        create: persona.education
                    }
                }
            })
        ]);
    } else {
        console.log('Creating fresh profile...');
        await prisma.profile.create({
            data: {
                userId: user.id,
                contactInfo: persona.contact,
                skills: persona.skills,
                projects: persona.projects,
                certifications: persona.certifications,
                preferences: {},
                experiences: {
                    create: persona.experiences
                },
                educations: {
                    create: persona.education
                }
            }
        });

        await prisma.user.update({
            where: { id: user.id },
            data: { name: persona.name }
        });
    }

    console.log('✅ Profile seeded successfully.');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding profile:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
