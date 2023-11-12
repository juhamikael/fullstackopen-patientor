
import { IDiagnosis } from "./diagnoses";

export enum Gender {
    Male = "male",
    Female = "female",
    Other = "other"
}

export enum HealthCheckRating {
    "Healthy" = 0,
    "LowRisk" = 1,
    "HighRisk" = 2,
    "CriticalRisk" = 3
}

interface BaseEntry {
    id: string;
    description: string;
    date: string;
    specialist: string;
    diagnosisCodes?: Array<IDiagnosis['code']>;
}

interface HealthCheckEntry extends BaseEntry {
    type: "HealthCheck";
    healthCheckRating: HealthCheckRating;
}


export interface OccupationalHealthcareEntry extends BaseEntry {
    type: "OccupationalHealthcare";
    employerName?: string;
    sickLeave?: {
        startDate: string;
        endDate: string;
    };
}


export interface HospitalEntry extends BaseEntry {
    type: "Hospital";
    discharge: {
        date: string;
        criteria: string;
    };

}

export type Entry =
    | HospitalEntry
    | OccupationalHealthcareEntry
    | HealthCheckEntry;

export type NonSensitivePatient = Omit<IPatient, 'ssn' | 'entries'>;
export type NonSensitivePatientEntry = Omit<IPatient, 'ssn' | 'entries'>;
export type NewPatientEntry = Omit<IPatient, 'id'>;

type UnionOmit<T, K extends string | number | symbol> = T extends unknown ? Omit<T, K> : never;

export type EntryWithoutId = UnionOmit<Entry, 'id'>;

export type HealthCheckEntryWithoutId = Omit<HealthCheckEntry, "id">;
export type OccupationalHealthcareEntryWithoutId = Omit<OccupationalHealthcareEntry, "id">;
export type HospitalEntryWithoutId = Omit<HospitalEntry, "id">;

export interface IPatient {
    id: string;
    name: string;
    dateOfBirth: string;
    ssn: string;
    gender: Gender;
    occupation: string;
    entries: Entry[]
}