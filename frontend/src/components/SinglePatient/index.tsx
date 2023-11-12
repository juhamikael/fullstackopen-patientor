import { useEffect, useState, FC, ReactNode, PropsWithChildren } from "react";
import { Diagnosis, Entry, Patient, EntryOrNew } from "../../types";
import { useLocation } from "react-router-dom";
import { Female, Male } from "@mui/icons-material";
import patientService from "../../services/patients";
import diagnoseService from "../../services/diagnoses";
import { BsHospital } from "react-icons/bs";
import { MdWorkOutline } from "react-icons/md";
import { parseISO, differenceInCalendarDays, format } from "date-fns";
import NewEntryForm from "./NewEntryForm";
import { RiHealthBookLine } from "react-icons/ri";
const assertNever = (value: never): never => {
  throw new Error(
    `Unhandled discriminated union member: ${JSON.stringify(value)}`
  );
};

interface EntryProps {
  entry: Entry;
  children?: ReactNode;
}

const HospitalEntry: FC<EntryProps> = ({ entry, children }) => {
  if (entry.type !== "Hospital") {
    return null;
  }

  return (
    <div>
      <div className="text-xl font-bold flex items-center gap-x-2">
        <BsHospital />
        Hospital Visit
      </div>
      <div className="text-xl flex items-center gap-x-2">{entry.date}</div>
      {children}
      <div className="border-b my-4" />
      {entry.discharge && (
        <div>
          <p className="text-xl font-semibold">Discharge:</p>
          <p>Date: {format(new Date(entry.discharge?.date), "yyyy-MM-dd")}</p>
          <p>Criteria: {entry.discharge.criteria}</p>
        </div>
      )}
    </div>
  );
};

const HealthCheckRating = ({ rating }: { rating: number }) => {
  let description;
  const localStyle = "flex gap-x-1 flex-col md:flex-row";
  switch (rating) {
    case 0:
      description = (
        <div className={localStyle}>
          <p className="text-green-600 font-semibold">Healthy</p>
          <p>The patient is in good shape with no immediate concerns.</p>
        </div>
      );
      break;
    case 1:
      description = (
        <div className={localStyle}>
          <p className="text-blue-600 font-semibold">Low Risk</p>
          <p>
            The patient experiences a few health problems and, therefore, should
            be monitored.
          </p>
        </div>
      );
      break;
    case 2:
      description = (
        <div className={localStyle}>
          <p className="text-yellow-600 font-semibold">High Risk</p>
          <p>
            The patient presents significant health issues which should be
            addressed and perhaps treated.
          </p>
        </div>
      );
      break;
    case 3:
      description = (
        <div className={localStyle}>
          <p className="text-red-600 font-semibold">Critical Risk</p>
          <p>
            The patient is in critical condition and is at risk for serious
            complications.
          </p>
        </div>
      );
      break;
    default:
      description = (
        <div className={localStyle}>
          <p className="text-green-600 font-semibold">Healthy</p>
          <p>
            No rating provided. By default, the patient is considered to be in
            good health.
          </p>
        </div>
      );
  }

  return <div>{description}</div>;
};

const HealthCheckEntry: FC<EntryProps> = ({ entry, children }) => {
  if (entry.type !== "HealthCheck") {
    return null;
  }

  return (
    <div>
      <div className="text-xl font-bold flex items-center gap-x-2">
        <RiHealthBookLine />
        Health Check
      </div>
      <div className="text-xl">{entry.date}</div>
      {children}
      <div className="border-b my-4" />

      <div className="">
        <span className="text-xl">Health status: </span>
        <HealthCheckRating rating={entry.healthCheckRating} />
      </div>
    </div>
  );
};

const OccupationalHealthcareEntry: FC<EntryProps> = ({ entry, children }) => {
  if (entry.type !== "OccupationalHealthcare") {
    return null;
  }

  return (
    <div>
      <div className="text-xl font-bold flex items-center gap-x-2">
        <MdWorkOutline />
        Occupational Healthcare
      </div>

      <div className="text-xl flex items-center gap-x-2">{entry.date}</div>
      <div>
        <span>Employer: </span>
        <span className="italic font-semibold">{entry.employerName}</span>
      </div>

      {children}
      <div className="border-b my-4" />

      {entry.sickLeave && (
        <div>
          <p className="text-xl font-semibold">Sick leave:</p>
          <p>Starts from: {entry.sickLeave?.startDate}</p>
          <p>Ends at: {entry.sickLeave?.endDate}</p>
          <p className="text-lg mt-2">
            Duration:{" "}
            {entry.sickLeave?.startDate &&
              entry.sickLeave?.endDate &&
              `${differenceInCalendarDays(
                parseISO(entry.sickLeave.endDate),
                parseISO(entry.sickLeave.startDate)
              )} days`}
          </p>
        </div>
      )}
    </div>
  );
};

const EntryDetails: React.FC<PropsWithChildren<{ entry: EntryOrNew }>> = ({
  entry,
  children,
}) => {
  switch (entry.type) {
    case "Hospital":
      return <HospitalEntry entry={entry}> {children} </HospitalEntry>;
    case "HealthCheck":
      return <HealthCheckEntry entry={entry}>{children} </HealthCheckEntry>;
    case "OccupationalHealthcare":
      return (
        <OccupationalHealthcareEntry entry={entry}>
          {children}
        </OccupationalHealthcareEntry>
      );
    default:
      return assertNever(entry);
  }
};

const SinglePatientPage = () => {
  const location = useLocation();
  const id = location.pathname.substring(10);

  const [patient, setPatient] = useState<Patient | undefined>();
  const [diagnoses, setDiagnoses] = useState<Diagnosis[] | undefined>();
  const [entries, setNewEntry] = useState<EntryOrNew[] | undefined>();

  useEffect(() => {
    const fetchPatient = async () => {
      const patient = await patientService.getById(id);
      setPatient(patient);
    };
    const fetchDiagnoses = async () => {
      const diagnoses = await diagnoseService.getAll();
      setDiagnoses(diagnoses);
    };
    fetchPatient();
    fetchDiagnoses();
  }, [id]);

  useEffect(() => {
    const fetchEntries = async () => {
      const patientEntries: Entry[] = await patientService.getEntries(id);
      setNewEntry(patientEntries);
    };
    fetchEntries();
  }, [id, entries?.length]);

  const matchDiagnose = (code: string) => {
    const matchedDiagnosis = diagnoses?.find(
      (diagnose) => diagnose.code === code
    );
    return matchedDiagnosis ? matchedDiagnosis.name : "Unknown diagnosis";
  };

  const entriesOrderedByDate = entries?.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div>
      <section id="name" className="flex flex-row text-4xl items-center ">
        <div>{patient?.name}</div>
        {patient?.gender === "female" ? (
          <Female fontSize="large" />
        ) : (
          <Male fontSize="large" />
        )}
      </section>

      <div className="border-b my-4" />

      <section id="info" className="">
        <div className="text-3xl">Information</div>

        <div>ssn: {patient?.ssn}</div>
        <div>occupation: {patient?.occupation}</div>
      </section>

      <NewEntryForm
        setNewEntry={setNewEntry}
        patientId={patient?.id}
        diagnoses={diagnoses}
      />

      <div className="border-b my-4" />

      <section id="entries">
        <div className="text-3xl">Entries</div>

        {entriesOrderedByDate?.map((entry) => (
          <div
            key={entry.description}
            className="border my-4 rounded-xl py-4 px-4 "
          >
            <EntryDetails entry={entry}>
              <div>{entry.description}</div>
              <div>
                {entry.diagnosisCodes && (
                  <ul className="list-disc px-8">
                    {entry.diagnosisCodes?.map((code) => (
                      <li key={code}>
                        {code} - {matchDiagnose(code)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </EntryDetails>
            <div className="border-b my-4" />
            <p className="font-semibold mt-4">Diagnose by {entry.specialist}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default SinglePatientPage;
