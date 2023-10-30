
export enum Gender {
    Male = "male",
    Female = "female",
    Other = "other"
}

export interface IPatient {
    id: string;
    name: string;
    dateOfBirth: string;
    ssn: string;
    gender: Gender;
    occupation: string;
}

export type NonSensitivePatientEntry = Omit<IPatient, 'ssn'>;
export type NewPatientEntry = Omit<IPatient, 'id'>;