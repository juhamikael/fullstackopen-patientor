import {
    EntryWithoutId,
    NewPatientEntry,
    HealthCheckRating,
    HealthCheckEntryWithoutId,
    HospitalEntryWithoutId,
    OccupationalHealthcareEntryWithoutId,
    Gender,
} from "./types/patients";

import { IDiagnosis } from "./types/diagnoses";

const toNewPatientEntry = (object: unknown): NewPatientEntry => {
    if (!object || typeof object !== 'object') {
        throw new Error('Incorrect or missing data');
    }
    if ('name' in object && 'dateOfBirth' in object && 'ssn' in object && 'gender' in object && 'occupation' in object) {
        const newEntry: NewPatientEntry = {
            name: parseString(object.name),
            dateOfBirth: parseDate(object.dateOfBirth),
            gender: parseGender(object.gender),
            ssn: parseSsn(object.ssn),
            occupation: parseString(object.occupation),
            entries: []
        };
        return newEntry;
    }

    throw new Error('Incorrect data: some fields are missing');
};


const parseSsn = (ssn: unknown): string => {
    if (!ssn || !isString(ssn)) {
        throw new Error('Incorrect or missing ssn: ' + ssn);
    }
    return ssn;
};

const isGender = (param: unknown): param is Gender => {
    return Object.values(Gender).includes(param as Gender);
};
const parseGender = (gender: unknown): Gender => {
    if (!gender || !isGender(gender)) {
        throw new Error('Incorrect or missing gender: ' + gender);
    }
    return gender;
};
const isString = (text: unknown): text is string => {
    return typeof text === 'string' || text instanceof String;
};

const isDate = (date: string): boolean => {
    return Boolean(Date.parse(date));
};

const parseDate = (date: unknown): string => {
    if (!date || !isString(date) || !isDate(date)) {
        throw new Error('Incorrect or missing date: ' + date);
    }
    return date;
};

const parseString = (name: unknown): string => {
    if (!name || !isString(name)) {
        throw new Error('Incorrect or missing name: ' + name);
    }
    return name;
};

const parseDiagnosisCodes = (codes: unknown): Array<IDiagnosis['code']> | undefined => {
    if (!codes) {
        return undefined;
    }
    if (!Array.isArray(codes)) {
        throw new Error('Incorrect diagnosisCodes: not an array');
    }
    return codes.map(code => {
        if (!isString(code)) {
            throw new Error('Incorrect diagnosisCode: not a string');
        }
        return code;
    });
};
const parseHealthCheckRating = (rating: unknown): HealthCheckRating => {
    if (rating === undefined || rating === null || typeof rating !== 'number') {
        throw new Error('Incorrect or missing HealthCheckRating');
    }

    return rating as HealthCheckRating;
};

const toPatientEntries = (object: unknown): EntryWithoutId => {
    if (!object || typeof object !== 'object' || object === null) {
        throw new Error('Incorrect or missing data');
    }

    const entryObject = object as { [key: string]: unknown };

    const baseEntry = {
        description: parseString(entryObject['description']),
        date: parseDate(entryObject['date']),
        specialist: parseString(entryObject['specialist']),
        diagnosisCodes: parseDiagnosisCodes(entryObject['diagnosisCodes'])
    };


    switch (entryObject['type']) {
        case "HealthCheck":
            return {
                ...baseEntry,
                type: "HealthCheck",
                healthCheckRating: parseHealthCheckRating(entryObject['healthCheckRating']),
            } as HealthCheckEntryWithoutId;
        case "OccupationalHealthcare":
            const occupationalEntry: OccupationalHealthcareEntryWithoutId = {
                ...baseEntry,
                type: "OccupationalHealthcare",
                employerName: parseString(entryObject['employerName']),
            };

            if (entryObject['sickLeave'] && typeof entryObject['sickLeave'] === 'object' && entryObject['sickLeave'] !== null) {
                const sickLeave = entryObject['sickLeave'] as { startDate: unknown, endDate: unknown };
                occupationalEntry.sickLeave = {
                    startDate: parseDate(sickLeave.startDate),
                    endDate: parseDate(sickLeave.endDate)
                };
            }
            return occupationalEntry;
        case "Hospital":
            if (!entryObject['discharge'] || typeof entryObject['discharge'] !== 'object' || entryObject['discharge'] === null) {
                throw new Error('Incorrect or missing discharge');
            }
            const discharge = entryObject['discharge'] as { date: unknown, criteria: unknown };
            return {
                ...baseEntry,
                type: "Hospital",
                discharge: {
                    date: parseDate(discharge.date),
                    criteria: parseString(discharge.criteria)
                }
            } as HospitalEntryWithoutId;
        default:
            throw new Error('Incorrect entry type');
    }
};

export { toNewPatientEntry, toPatientEntries };