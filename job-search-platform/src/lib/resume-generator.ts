'use server';

import '@/lib/load-root-env';
import { prisma } from '@/lib/prisma';
import { getLLMClient } from '@/lib/llm';
import { ResumeGenerator } from '@/lib/llm';
import { Profile } from '@prisma/client';
import { isMockMode } from './env';
import { ExaggerationLevel } from '@/types/llm';
import { getResolvedZAIConfig } from '@/lib/zai-config';
import type { ResumeDocumentData } from '@/lib/resume-document';

export interface ResumeGenerationRequest {
    jobDescription: string;
    profile: any; // Profile data
    exaggerationLevel: ExaggerationLevel;
    customInstructions?: string;
}

const DEFAULT_REWRITE_TIMEOUT_MS = 15000;

function stripMarkdownCodeBlocks(content: string) {
    if (content.includes('```json')) {
        return content.replace(/```json\n?|\n?```/g, '').trim();
    }

    if (content.includes('```')) {
        return content.replace(/```\n?|\n?```/g, '').trim();
    }

    return content.trim();
}

function cleanupJsonCandidate(content: string) {
    return content
        .replace(/^[^{[]*/, '')
        .replace(/,\s*([}\]])/g, '$1')
        .trim();
}

function balanceJsonDelimiters(content: string) {
    const stack: string[] = [];
    let inString = false;
    let escaping = false;
    let balanced = '';

    for (const char of content) {
        balanced += char;

        if (escaping) {
            escaping = false;
            continue;
        }

        if (char === '\\') {
            escaping = true;
            continue;
        }

        if (char === '"') {
            inString = !inString;
            continue;
        }

        if (inString) {
            continue;
        }

        if (char === '{') {
            stack.push('}');
        } else if (char === '[') {
            stack.push(']');
        } else if ((char === '}' || char === ']') && stack[stack.length - 1] === char) {
            stack.pop();
        }
    }

    if (inString) {
        balanced += '"';
    }

    balanced = balanced.replace(/,\s*$/, '');

    while (stack.length > 0) {
        balanced += stack.pop();
    }

    return balanced.replace(/,\s*([}\]])/g, '$1');
}

function extractArrayBlock(content: string, field: string) {
    const fieldIndex = content.indexOf(`"${field}"`);
    if (fieldIndex === -1) {
        return null;
    }

    const startIndex = content.indexOf('[', fieldIndex);
    if (startIndex === -1) {
        return null;
    }

    let depth = 0;
    let inString = false;
    let escaping = false;

    for (let index = startIndex; index < content.length; index += 1) {
        const char = content[index];

        if (escaping) {
            escaping = false;
            continue;
        }

        if (char === '\\') {
            escaping = true;
            continue;
        }

        if (char === '"') {
            inString = !inString;
            continue;
        }

        if (inString) {
            continue;
        }

        if (char === '[') {
            depth += 1;
        } else if (char === ']') {
            depth -= 1;
            if (depth === 0) {
                return content.slice(startIndex, index + 1);
            }
        }
    }

    return content.slice(startIndex);
}

function parseArrayField<T>(content: string, field: string) {
    const block = extractArrayBlock(content, field);
    if (!block) {
        return [];
    }

    try {
        return JSON.parse(balanceJsonDelimiters(block)) as T[];
    } catch {
        return [];
    }
}

function extractStringField(content: string, field: string) {
    const match = content.match(new RegExp(`"${field}"\\s*:\\s*"([\\s\\S]*?)"`));
    return match?.[1]?.replace(/\\"/g, '"') ?? '';
}

function extractObjectField(content: string, field: string) {
    const fieldIndex = content.indexOf(`"${field}"`);
    if (fieldIndex === -1) {
        return null;
    }

    const startIndex = content.indexOf('{', fieldIndex);
    if (startIndex === -1) {
        return null;
    }

    let depth = 0;
    let inString = false;
    let escaping = false;

    for (let index = startIndex; index < content.length; index += 1) {
        const char = content[index];

        if (escaping) {
            escaping = false;
            continue;
        }

        if (char === '\\') {
            escaping = true;
            continue;
        }

        if (char === '"') {
            inString = !inString;
            continue;
        }

        if (inString) {
            continue;
        }

        if (char === '{') {
            depth += 1;
        } else if (char === '}') {
            depth -= 1;
            if (depth === 0) {
                return content.slice(startIndex, index + 1);
            }
        }
    }

    return content.slice(startIndex);
}

function salvageResumeDocument(
    content: string,
    fallbackProfile: any,
): ResumeDocumentData {
    const fallbackContact = fallbackProfile?.contactInfo || {};
    const repairedContent = cleanupJsonCandidate(content);

    let contactInfo = {
        name: fallbackContact.name || 'Candidate',
        email: fallbackContact.email || '',
        phone: fallbackContact.phone || '',
        location: fallbackContact.location || '',
    };

    const contactBlock = extractObjectField(repairedContent, 'contactInfo');
    if (contactBlock) {
        try {
            contactInfo = {
                ...contactInfo,
                ...(JSON.parse(balanceJsonDelimiters(contactBlock)) as ResumeDocumentData['contactInfo']),
            };
        } catch {
            contactInfo = {
                name: extractStringField(contactBlock, 'name') || contactInfo.name,
                email: extractStringField(contactBlock, 'email') || contactInfo.email,
                phone: extractStringField(contactBlock, 'phone') || contactInfo.phone,
                location: extractStringField(contactBlock, 'location') || contactInfo.location,
            };
        }
    }

    return {
        contactInfo,
        summary: extractStringField(repairedContent, 'summary') || '',
        experience: parseArrayField<ResumeDocumentData['experience'][number]>(repairedContent, 'experience'),
        education: parseArrayField<ResumeDocumentData['education'][number]>(repairedContent, 'education'),
        skills: parseArrayField<string>(repairedContent, 'skills'),
    };
}

function parseResumeJsonContent(
    content: string,
    fallbackProfile: any,
): ResumeDocumentData {
    const cleaned = cleanupJsonCandidate(stripMarkdownCodeBlocks(content));
    const attempts = Array.from(
        new Set([
            cleaned,
            balanceJsonDelimiters(cleaned),
        ]),
    ).filter(Boolean);

    for (const candidate of attempts) {
        try {
            return JSON.parse(candidate) as ResumeDocumentData;
        } catch {
            continue;
        }
    }

    console.error('Failed to parse LLM response as JSON:', cleaned);

    const salvaged = salvageResumeDocument(cleaned, fallbackProfile);
    const hasStructuredContent =
        Boolean(salvaged.summary) ||
        salvaged.experience.length > 0 ||
        salvaged.education.length > 0 ||
        salvaged.skills.length > 0;

    if (hasStructuredContent) {
        return salvaged;
    }

    return {
        contactInfo: {
            name: fallbackProfile?.contactInfo?.name || 'Candidate',
            email: fallbackProfile?.contactInfo?.email || '',
            phone: fallbackProfile?.contactInfo?.phone || '',
            location: fallbackProfile?.contactInfo?.location || '',
        },
        summary: cleaned,
        experience: [],
        education: [],
        skills: [],
    };
}

function safeString(value: unknown) {
    if (typeof value === 'string') {
        return value.trim();
    }
    return '';
}

function normalizeProfileSkills(skills: unknown) {
    if (!Array.isArray(skills)) {
        return [];
    }

    return skills
        .map((skill) => {
            if (typeof skill === 'string') {
                return skill.trim();
            }
            if (skill && typeof skill === 'object' && 'name' in skill) {
                return safeString((skill as { name?: unknown }).name);
            }
            return '';
        })
        .filter(Boolean);
}

function buildTimeoutFallbackResume(
    profile: any,
    jobDescription: string,
): ResumeDocumentData {
    const contact = profile?.contactInfo || {};
    const workHistory = Array.isArray(profile?.experiences)
        ? profile.experiences
        : Array.isArray(profile?.workHistory)
            ? profile.workHistory
            : [];
    const education = Array.isArray(profile?.educations)
        ? profile.educations
        : Array.isArray(profile?.education)
            ? profile.education
            : [];

    const topSkills = normalizeProfileSkills(profile?.skills).slice(0, 12);

    const summaryParts = [
        safeString(profile?.summary),
        topSkills.length > 0
            ? `Core strengths: ${topSkills.slice(0, 5).join(', ')}.`
            : '',
        'This tailored draft was generated from your saved profile because live rewrite response was slow.',
    ].filter(Boolean);

    return {
        contactInfo: {
            name: safeString(contact?.name) || 'Candidate',
            email: safeString(contact?.email),
            phone: safeString(contact?.phone),
            location: safeString(contact?.location),
        },
        summary: summaryParts.join(' '),
        experience: workHistory.slice(0, 6).map((role: any, index: number) => ({
            id: safeString(role?.id) || `fallback-exp-${index + 1}`,
            title: safeString(role?.title) || safeString(role?.role) || 'Untitled role',
            company: safeString(role?.company),
            location: safeString(role?.location),
            startDate: safeString(role?.startDate),
            endDate: safeString(role?.endDate),
            description: safeString(role?.description) || 'No role details provided in profile.',
        })),
        education: education.slice(0, 4).map((item: any, index: number) => ({
            id: safeString(item?.id) || `fallback-edu-${index + 1}`,
            degree: safeString(item?.degree),
            school: safeString(item?.school) || safeString(item?.institution),
            location: safeString(item?.location),
            startDate: safeString(item?.startDate),
            endDate: safeString(item?.endDate),
        })),
        skills: topSkills,
    };
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error(`REWRITE_TIMEOUT:${timeoutMs}`));
        }, timeoutMs);

        promise
            .then((value) => {
                clearTimeout(timer);
                resolve(value);
            })
            .catch((error) => {
                clearTimeout(timer);
                reject(error);
            });
    });
}

/**
 * Generate a tailored resume for a specific job
 */
export async function generateTailoredResume(request: ResumeGenerationRequest) {
    try {
        const zai = getResolvedZAIConfig();
        // Get user's LLM configuration from database
        // For now, use default OpenAI configuration
        const llmConfig = {
            provider: 'custom' as const,
            model: zai.model,
            temperature: 0.7,
            maxTokens: 2000,
            apiKey: zai.apiKey,
            apiEndpoint: zai.apiEndpoint,
        };

        // Check for Mock Mode explicitly
        if (isMockMode()) {
            console.warn('Mock Mode active in generateTailoredResume');
            throw new Error('LLM_MOCK_FALLBACK');
        }

        // Verify API Key existence when not in Mock Mode
        if (!zai.apiKey) {
            throw new Error('Configuration Error: no Z.AI API key is set. Ensure repo-local secrets are configured or enable NEXT_PUBLIC_MOCK_MODE.');
        }

        const llmClient = getLLMClient(llmConfig);
        const generator = new ResumeGenerator(llmClient);

        const configuredTimeout = Number.parseInt(
            process.env.JOBSCOUT_REWRITE_TIMEOUT_MS || '',
            10,
        );
        const timeoutMs =
            Number.isFinite(configuredTimeout) && configuredTimeout > 0
                ? configuredTimeout
                : DEFAULT_REWRITE_TIMEOUT_MS;

        let response;
        try {
            response = await withTimeout(
                generator.generateTailoredResume({
                    jobDescription: request.jobDescription,
                    userProfile: request.profile,
                    exaggerationLevel: request.exaggerationLevel,
                    customInstructions: request.customInstructions,
                }),
                timeoutMs,
            );
        } catch (timeoutOrProviderError) {
            const message =
                timeoutOrProviderError instanceof Error
                    ? timeoutOrProviderError.message
                    : String(timeoutOrProviderError);

            if (message.startsWith('REWRITE_TIMEOUT:')) {
                console.warn(
                    `Rewrite timed out after ${timeoutMs}ms; using profile fallback draft.`,
                );
                const fallback = buildTimeoutFallbackResume(
                    request.profile,
                    request.jobDescription,
                );
                return {
                    content: fallback,
                    usage: {
                        promptTokens: 0,
                        completionTokens: 0,
                        totalTokens: 0,
                    },
                };
            }

            throw timeoutOrProviderError;
        }

        const parsedContent = parseResumeJsonContent(response.content, request.profile);

        return {
            content: parsedContent,
            usage: response.usage,
        };
    } catch (error) {
        console.error('Failed to generate resume:', error);
        throw error; // Re-throw to be handled by caller
    }
}

/**
 * Generate and preview resume - server action for Next.js
 */
export async function generateAndPreviewResume(
    jobId: string,
    exaggerationLevel: ExaggerationLevel = 'professional',
    customInstructions?: string,
) {
    let profile: any = null;
    try {
        // Fetch job details
        const job = await prisma.job.findUnique({
            where: { id: jobId },
        });

        if (!job) {
            throw new Error('Job not found');
        }

        // Get user profile (assuming single user for now)
        profile = await prisma.profile.findFirst({
            include: { experiences: true, educations: true }
        });

        if (!profile) {
            throw new Error('Profile not found');
        }

        // Generate tailored resume
        const result = await generateTailoredResume({
            jobDescription: job.description,
            profile,
            exaggerationLevel,
            customInstructions,
        });

        return {
            success: true,
            content: result.content,
            usage: result.usage,
        };
    } catch (error) {
        console.error('Failed to generate and preview resume:', error);

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
