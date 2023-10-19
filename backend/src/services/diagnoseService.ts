
import { IDiagnosis } from "../types/diagnoses";
import diagnoses from "../data/diagnoses";
const getEntries = (): IDiagnosis[] => {
    return diagnoses;
};

export default {
    getEntries
};