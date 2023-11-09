import { useEffect, useState } from "react";
import { Patient } from "../../types";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@mui/material";
import { Female, Male } from "@mui/icons-material";
import patientService from "../../services/patients";

const SinglePatientPage = () => {
  const location = useLocation();
  const id = location.pathname.substring(10);

  const [patient, setPatient] = useState<Patient | undefined>();

  useEffect(() => {
    const fetchPatient = async () => {
      const patient = await patientService.getById(id);
      setPatient(patient);
    };
    fetchPatient();
  }, []);

  return (
    <Card>
      <div
        style={{
          flexDirection: "row",
          display: "flex",
          alignItems: "center",
        }}
      >
        <CardHeader title={patient?.name} />
        {patient?.gender === "female" ? <Female /> : <Male />}
      </div>
      <CardContent>
        <div>ssn: {patient?.ssn}</div>
        <div>occupation: {patient?.occupation}</div>
      </CardContent>
    </Card>
  );
};

export default SinglePatientPage;
