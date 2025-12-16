import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register standard fonts
Font.register({
    family: 'Helvetica',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyCg4TY1x.ttf' },
        { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyCg4TY1x.ttf', fontWeight: 'bold' },
    ]
});

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Helvetica',
        fontSize: 11,
        lineHeight: 1.5,
    },
    section: {
        marginBottom: 10,
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        paddingBottom: 10,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    contact: {
        fontSize: 10,
        color: '#666',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        textTransform: 'uppercase',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingBottom: 2,
    },
    jobHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    jobTitle: {
        fontWeight: 'bold',
    },
    company: {
        fontStyle: 'italic',
    },
    date: {
        fontSize: 10,
        color: '#666',
    },
    description: {
        marginTop: 5,
    },
    skillList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 5,
    },
    skill: {
        backgroundColor: '#f0f0f0',
        padding: '2 5',
        borderRadius: 3,
        fontSize: 9,
    },
});

const stripHtml = (html: string) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
};

interface ResumeContent {
    contactInfo: {
        name: string;
        email: string;
        phone: string;
        location: string;
    };
    summary: string;
    experience: Array<{
        id: string;
        title: string;
        company: string;
        location: string;
        startDate: string;
        endDate: string;
        description: string;
    }>;
    education: Array<{
        id: string;
        degree: string;
        school: string;
        location: string;
        startDate: string;
        endDate: string;
    }>;
    skills: string[];
}

interface ResumePDFProps {
    content: ResumeContent;
}

export function ResumePDF({ content }: ResumePDFProps) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.name}>{content.contactInfo.name}</Text>
                    <Text style={styles.contact}>
                        {content.contactInfo.email} | {content.contactInfo.phone} | {content.contactInfo.location}
                    </Text>
                </View>

                {/* Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Professional Summary</Text>
                    <Text>{stripHtml(content.summary)}</Text>
                </View>

                {/* Experience */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Experience</Text>
                    {content.experience.map((job) => (
                        <View key={job.id} style={{ marginBottom: 10 }}>
                            <View style={styles.jobHeader}>
                                <Text style={styles.jobTitle}>{job.title}</Text>
                                <Text style={styles.date}>{job.startDate} - {job.endDate}</Text>
                            </View>
                            <View style={styles.jobHeader}>
                                <Text style={styles.company}>{job.company}</Text>
                                <Text style={styles.date}>{job.location}</Text>
                            </View>
                            <Text style={styles.description}>{job.description}</Text>
                        </View>
                    ))}
                </View>

                {/* Education */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Education</Text>
                    {content.education.map((edu) => (
                        <View key={edu.id} style={{ marginBottom: 5 }}>
                            <View style={styles.jobHeader}>
                                <Text style={styles.jobTitle}>{edu.school}</Text>
                                <Text style={styles.date}>{edu.startDate} - {edu.endDate}</Text>
                            </View>
                            <Text>{edu.degree}</Text>
                        </View>
                    ))}
                </View>

                {/* Skills */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Skills</Text>
                    <View style={styles.skillList}>
                        <Text>{content.skills.join(' • ')}</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
}
