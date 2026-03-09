import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { ResumeDocumentData } from '@/lib/resume-document';

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

interface ResumePDFProps {
    content: ResumeDocumentData;
    mode?: 'light' | 'dark';
}

export function ResumePDF({ content, mode = 'light' }: ResumePDFProps) {
    const isDark = mode === 'dark';

    const themeStyles = {
        page: {
            backgroundColor: isDark ? '#171717' : '#ffffff', // neutral-900 vs white
            color: isDark ? '#fafafa' : '#000000', // neutral-50 vs black
        },
        headerBorder: {
            borderBottomColor: isDark ? '#404040' : '#000000', // neutral-700 vs black
        },
        sectionBorder: {
            borderBottomColor: isDark ? '#404040' : '#cccccc', // neutral-700 vs gray-300
        },
        text: {
            color: isDark ? '#d4d4d4' : '#666666', // neutral-400 vs gray-600
        },
        skill: {
            backgroundColor: isDark ? '#262626' : '#f0f0f0', // neutral-800 vs gray-100
            color: isDark ? '#fafafa' : '#000000',
        }
    };

    return (
        <Document>
            <Page size="A4" style={[styles.page, themeStyles.page]}>
                {/* Header */}
                <View style={[styles.header, themeStyles.headerBorder]}>
                    <Text style={[styles.name, { color: isDark ? '#fafafa' : '#000000' }]}>{content.contactInfo.name}</Text>
                    <Text style={[styles.contact, themeStyles.text]}>
                        {content.contactInfo.email} | {content.contactInfo.phone} | {content.contactInfo.location}
                    </Text>
                </View>

                {/* Summary */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, themeStyles.sectionBorder, { color: isDark ? '#fafafa' : '#000000' }]}>Professional Summary</Text>
                    <Text style={{ color: isDark ? '#fafafa' : '#000000' }}>{stripHtml(content.summary)}</Text>
                </View>

                {/* Experience */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, themeStyles.sectionBorder, { color: isDark ? '#fafafa' : '#000000' }]}>Experience</Text>
                    {content.experience.map((job) => (
                        <View key={job.id} style={{ marginBottom: 10 }}>
                            <View style={styles.jobHeader}>
                                <Text style={[styles.jobTitle, { color: isDark ? '#fafafa' : '#000000' }]}>{job.title}</Text>
                                <Text style={[styles.date, themeStyles.text]}>{job.startDate} - {job.endDate}</Text>
                            </View>
                            <View style={styles.jobHeader}>
                                <Text style={[styles.company, { color: isDark ? '#d4d4d4' : '#000000' }]}>{job.company}</Text>
                                <Text style={[styles.date, themeStyles.text]}>{job.location}</Text>
                            </View>
                            <Text style={[styles.description, { color: isDark ? '#fafafa' : '#000000' }]}>{job.description}</Text>
                        </View>
                    ))}
                </View>

                {/* Education */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, themeStyles.sectionBorder, { color: isDark ? '#fafafa' : '#000000' }]}>Education</Text>
                    {content.education.map((edu) => (
                        <View key={edu.id} style={{ marginBottom: 5 }}>
                            <View style={styles.jobHeader}>
                                <Text style={[styles.jobTitle, { color: isDark ? '#fafafa' : '#000000' }]}>{edu.school}</Text>
                                <Text style={[styles.date, themeStyles.text]}>{edu.startDate} - {edu.endDate}</Text>
                            </View>
                            <Text style={{ color: isDark ? '#fafafa' : '#000000' }}>{edu.degree}</Text>
                        </View>
                    ))}
                </View>

                {/* Skills */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, themeStyles.sectionBorder, { color: isDark ? '#fafafa' : '#000000' }]}>Skills</Text>
                    <View style={styles.skillList}>
                        <Text style={{ color: isDark ? '#e5e5e5' : '#000000' }}>{content.skills.join(' • ')}</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
}
