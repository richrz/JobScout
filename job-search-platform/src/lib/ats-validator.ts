/**
 * ATS (Applicant Tracking System) Validation Utility
 * Validates resume formatting for ATS compatibility
 */

export interface ATSValidationCriteria {
    usesSimpleFonts: boolean;
    avoidsTablesForLayout: boolean;
    hasProperHierarchy: boolean;
    hasSelectableText: boolean;
}

export interface ATSValidationResult {
    isCompliant: boolean;
    issues: string[];
}

export function validateATSCompliance(criteria: ATSValidationCriteria): ATSValidationResult {
    const issues: string[] = [];

    if (!criteria.usesSimpleFonts) {
        issues.push('Uses complex fonts that may not be readable by ATS systems');
    }

    if (!criteria.avoidsTablesForLayout) {
        issues.push('Uses tables for layout which can confuse ATS parsers');
    }

    if (!criteria.hasProperHierarchy) {
        issues.push('Missing proper heading hierarchy');
    }

    if (!criteria.hasSelectableText) {
        issues.push('Text is not selectable (may be images)');
    }

    return {
        isCompliant: issues.length === 0,
        issues,
    };
}
