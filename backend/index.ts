import express from 'express';
import cors from 'cors';
const app = express();
import diagnoseRouter from './src/routes/diagnoses';
import patientRouter from "./src/routes/patients";

app.use(express.json());
app.use(cors());

const PORT = 3001;

app.get('/api/ping', (_req, res) => {
    console.log('someone pinged here');
    res.send('pong');
});

app.use('/api/diagnoses', diagnoseRouter);
app.use('/api/patients', patientRouter);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});