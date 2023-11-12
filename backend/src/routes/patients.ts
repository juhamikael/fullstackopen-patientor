import express from 'express';
import patientService from '../services/patientService';
import { toNewPatientEntry, toPatientEntries } from '../utils';
import { v4 as uuidv4 } from 'uuid';
const router = express.Router();
router.get('/', (_req, res) => {
    res.send(patientService.getNonSensitiveEntries());
});

router.get('/sensitive', (_req, res) => {
    res.send(patientService.getEntries());
});

router.get('/:id/entries', (_req, res) => {
    try {
        const patient = patientService.getEntries().find(p => p.id === _req.params.id);
        if (patient) {
            res.json(patient.entries);
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

router.post("/:id/entries", (req, res) => {
    try {
        const patientId = req.params.id;
        const entryWithoutId = toPatientEntries(req.body);
        const newEntry = {
            ...entryWithoutId,
            id: uuidv4(),
        };

        const patients = patientService.getEntries();

        const patient = patients.find((p) => p.id === patientId);

        if (!patient) {
            res.status(404).send({ error: "Patient not found." });
            return;
        }
        patient.entries.push(newEntry);


        res.json(newEntry);

    } catch (error: unknown) {
        let errorMessage = "Something went wrong.";
        if (error instanceof Error) {
            errorMessage += " Error: " + error.message;
        }
        res.status(400).send(errorMessage);
    }
});


export default router;