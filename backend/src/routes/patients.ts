import express from 'express';
import patientService from '../services/patientService';
import { toNewPatientEntry } from '../utils';
const router = express.Router();

router.get('/', (_req, res) => {
    res.send(patientService.getNonSensitiveEntries());
});

router.get('/sensitive', (_req, res) => {
    res.send(patientService.getEntries());
});

router.get('/:id', (_req, res) => {
    try {
        const patient = patientService.getEntries().find(p => p.id === _req.params.id);
        if (patient) {
            res.json(patient);
        } else {
            res.status(404).send({ error: "Patient not found." });
        }
    } catch (error: unknown) {
        res.status(400).send({
            error: "Something went wrong.",
            message: error instanceof Error ? error.message : "Unknown error"
        });
    }
});

router.post('/', (_req, res) => {
    try {
        const newPatientEntry = toNewPatientEntry(_req.body);
        const addedEntry = patientService.addEntry(newPatientEntry);
        res.json(addedEntry);
    } catch (error: unknown) {
        let errorMessage = "Something went wrong.";
        if (error instanceof Error) {
            errorMessage += "Error: " + error.message;
        }
        res.status(400).send(errorMessage);
    }
});

export default router;