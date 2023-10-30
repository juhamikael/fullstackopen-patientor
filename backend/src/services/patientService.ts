
import { IPatient, NewPatientEntry, NonSensitivePatientEntry } from "../types/patients";
import patients from "../data/patients";
import { v1 as uuid } from 'uuid';

const getEntries = (): IPatient[] => {
    return patients;
};

const getNonSensitiveEntries = (): NonSensitivePatientEntry[] => {
    return patients.map(({ id, name, dateOfBirth, gender, occupation }) => ({
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
        occupation: data.occupation
    };
    patients.push(newPatientEntry);
    return newPatientEntry;
};

export default {
    addEntry,
    getEntries,
    getNonSensitiveEntries
};