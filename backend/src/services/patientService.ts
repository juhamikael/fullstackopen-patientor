
import { IPatient, NonSensitivePatientEntry } from "../types/patients";
import patients from "../data/patients";

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

export default {
    getEntries,
    getNonSensitiveEntries
};