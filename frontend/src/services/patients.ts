import axios from "axios";
import { Patient, PatientFormValues, EntryWithoutId, Entry } from "../types";

import { apiBaseUrl } from "../constants";

const getAll = async () => {
  const { data } = await axios.get<Patient[]>(
    `${apiBaseUrl}/patients`
  );

  return data;
};

const getById = async (id: string) => {
  const { data } = await axios.get<Patient>(
    `${apiBaseUrl}/patients/${id}`
  );

  return data;
};

const create = async (object: PatientFormValues) => {
  const { data } = await axios.post<Patient>(
    `${apiBaseUrl}/patients`,
    object
  );

  return data;
};


const getEntries = async (id: string) => {
  const { data } = await axios.get<Entry[]>(
    `${apiBaseUrl}/patients/${id}/entries`
  );

  return data;

};

const createEntry = async (patientId: string, entryObject: EntryWithoutId) => {
  const { data } = await axios.post<EntryWithoutId>(
    `${apiBaseUrl}/patients/${patientId}/entries`,
    entryObject
  );

  return data;
};

export default {
  getAll, getById, create, createEntry, getEntries
};

