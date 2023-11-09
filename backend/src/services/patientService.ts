
import { IPatient, NewPatientEntry, NonSensitivePatientEntry } from "../types/patients";
import patientEntries from "../data/patients";
import { v1 as uuid } from 'uuid';

const getEntries = (): IPatient[] => {
    return patientEntries;
};

const getNonSensitiveEntries = (): NonSensitivePatientEntry[] => {
    return patientEntries.map(({ id, name, dateOfBirth, gender, occupation }) => ({
        id,
        name,
        dateOfBirth,
        gender,
        occupation
    }));
};

const addEntry = (data: NewPatientEntry) => {
    const id = uuid();
    const newPatientEntry = {
        id: id,
        name: data.name,
        dateOfBirth: data.dateOfBirth,
        ssn: data.ssn,
        gender: data.gender,
        occupation: data.occupation,
        entries: []
    };
    patientEntries.push(newPatientEntry);
    return newPatientEntry;
};

export default {
    addEntry,
    getEntries,
    getNonSensitiveEntries
};