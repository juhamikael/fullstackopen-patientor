import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import patientService from "@/services/patients";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Entry, EntryOrNew, IDiagnosis } from "@/types";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Textarea } from "../ui/textarea";
import { MultiSelect } from "../ui/multi-select";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

const healthCheckSchema = z.object({
  date: z.date(),
  description: z.string().min(10).max(400),
  specialist: z.string().min(3).max(50),
  diagnosisCodes: z.string().array().optional().default([]),
  type: z.enum(["HealthCheck"]),
  healthCheckRating: z.number().min(0).max(3),
});

const hospitalEntrySchema = z.object({
  date: z.date(),
  description: z.string().min(10).max(400),
  specialist: z.string().min(3).max(50),
  diagnosisCodes: z.string().array().optional().default([]),
  type: z.enum(["Hospital"]),
  discharge: z.object({
    date: z.date(),
    criteria: z.string().min(3).max(50),
  }),
});

const occupationalHealthcareEntrySchema = z.object({
  date: z.date(),
  description: z.string().min(10).max(400),
  specialist: z.string().min(3).max(50),
  diagnosisCodes: z.string().array().optional().default([]),
  type: z.enum(["OccupationalHealthcare"]),
  employerName: z.string().min(3).max(50),
  sickLeave: z.object({
    startDate: z.date(),
    endDate: z.date(),
  }),
});

const NewEntryForm = ({
  diagnoses,
  patientId,
  setNewEntry,
}: {
  diagnoses: IDiagnosis[] | undefined;
  patientId: string | undefined;
  setNewEntry: React.Dispatch<React.SetStateAction<EntryOrNew[] | undefined>>;
}) => {
  const healthCheckForm = useForm<z.infer<typeof healthCheckSchema>>({
    resolver: zodResolver(healthCheckSchema),
    defaultValues: {
      date: new Date(),
      description: "",
      diagnosisCodes: [],
      type: "HealthCheck",
      healthCheckRating: 0,
      specialist: "",
    },
  });

  const hospitalEntryForm = useForm<z.infer<typeof hospitalEntrySchema>>({
    resolver: zodResolver(hospitalEntrySchema),
    defaultValues: {
      date: new Date(),
      description: "",
      diagnosisCodes: [],
      type: "Hospital",
      discharge: {
        date: new Date(),
        criteria: "",
      },
      specialist: "",
    },
  });

  const occupationalHealthcareEntryForm = useForm<
    z.infer<typeof occupationalHealthcareEntrySchema>
  >({
    resolver: zodResolver(occupationalHealthcareEntrySchema),
    defaultValues: {
      date: new Date(),
      description: "",
      diagnosisCodes: [],
      type: "OccupationalHealthcare",
      employerName: "",
      sickLeave: {
        startDate: new Date(),
        endDate: new Date(),
      },
      specialist: "",
    },
  });

  const [healthCheckRating, setHealthCheckRating] = useState("Healthy");

  async function onSubmit(
    values:
      | z.infer<typeof healthCheckSchema>
      | z.infer<typeof hospitalEntrySchema>
      | z.infer<typeof occupationalHealthcareEntrySchema>
  ) {
    if (!patientId) {
      return "Not valid id";
    }

    if (!values.description || values.description.length < 10) {
      toast.warning(
        "Description is required and must be at least 10 characters"
      );
      return "Not valid description";
    }

    try {
      const formattedValues = {
        ...values,
        date: format(new Date(values.date), "yyyy-MM-dd"),
      };
      await patientService.createEntry(patientId, formattedValues);
      const patientEntries: Entry[] = await patientService.getEntries(
        patientId
      );
      setNewEntry(patientEntries);
      healthCheckForm.reset();
      hospitalEntryForm.reset();
      occupationalHealthcareEntryForm.reset();
      toast.success("Record created successfully!");
    } catch (error) {
      toast.error("Failed to create entry");
      console.error("Failed to create entry:", error);
    }
  }

  const diagnosesData =
    diagnoses?.map((diagnosis) => ({
      value: diagnosis.code,
      label: diagnosis.name,
    })) || [];

  return (
    <>
      <Toaster richColors />
      <Card>
        <Tabs defaultValue="">
          <TabsList className="flex gap-x-2 ">
            <TabsTrigger
              className="w-full border border-black/5"
              value="healthCheckEntry"
            >
              Health Check Entry
            </TabsTrigger>
            <TabsTrigger
              className="w-full border border-black/5"
              value="hospitalEntry"
            >
              Hospital Entry
            </TabsTrigger>
            <TabsTrigger
              className="w-full border border-black/5"
              value="occupationalHealthcareEntry"
            >
              Occupational Healthcare Entry
            </TabsTrigger>
          </TabsList>
          <CardHeader>New Entry</CardHeader>

          <TabsContent value="healthCheckEntry">
            <CardContent>
              <Form {...healthCheckForm}>
                <form
                  onSubmit={healthCheckForm.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    name="date"
                    control={healthCheckForm.control}
                    render={({ field }) => (
                      <FormItem className={cn("flex flex-col")}>
                        <FormLabel>Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  " pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="description"
                    control={healthCheckForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Type the description here"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="diagnosisCodes"
                    control={healthCheckForm.control}
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormItem className="mb-5">
                        <FormLabel>Diagnosis Codes</FormLabel>
                        <MultiSelect
                          selected={value || []}
                          options={diagnosesData}
                          onChange={(newValue) => {
                            onChange(newValue);
                          }}
                          {...field}
                        />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="specialist"
                    control={healthCheckForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specialist</FormLabel>
                        <FormControl>
                          <Input placeholder="MD House" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="healthCheckRating"
                    control={healthCheckForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Health Check Rating</FormLabel>
                        <FormControl>
                          <Slider
                            defaultValue={[0]}
                            max={3}
                            step={1}
                            onValueChange={(value) => {
                              const selectedValue =
                                value as unknown as number[];
                              field.onChange(selectedValue[0]);
                              switch (selectedValue[0]) {
                                case 0:
                                  setHealthCheckRating("Healthy");
                                  break;
                                case 1:
                                  setHealthCheckRating("Low Risk");
                                  break;
                                case 2:
                                  setHealthCheckRating("High Risk");
                                  break;
                                case 3:
                                  setHealthCheckRating("Critical Risk");
                                  break;
                                default:
                                  setHealthCheckRating("Healthy");
                                  break;
                              }
                            }}
                          />
                        </FormControl>
                        <span className="text-center text-lg">
                          {healthCheckRating}
                        </span>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button className={cn("w-full")} type="submit">
                    Submit
                  </Button>
                </form>
              </Form>
            </CardContent>
          </TabsContent>
          <TabsContent value="hospitalEntry">
            <CardContent>
              <Form {...hospitalEntryForm}>
                <form
                  onSubmit={hospitalEntryForm.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    name="date"
                    control={hospitalEntryForm.control}
                    render={({ field }) => (
                      <FormItem className={cn("flex flex-col")}>
                        <FormLabel>Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="description"
                    control={hospitalEntryForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Type the description here"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="diagnosisCodes"
                    control={hospitalEntryForm.control}
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormItem className="mb-5">
                        <FormLabel>Diagnosis Codes</FormLabel>
                        <MultiSelect
                          selected={value || []}
                          options={diagnosesData}
                          onChange={(newValue) => {
                            onChange(newValue);
                          }}
                          {...field}
                        />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="discharge.date"
                    control={hospitalEntryForm.control}
                    render={({ field }) => (
                      <FormItem className={cn("flex flex-col")}>
                        <FormLabel>Discharge Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  " pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="discharge.criteria"
                    control={hospitalEntryForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discharge</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Type the discharge here"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="border-b my-4" />

                  <FormField
                    name="specialist"
                    control={hospitalEntryForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specialist</FormLabel>
                        <FormControl>
                          <Input placeholder="MD House" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Submit</Button>
                </form>
              </Form>
            </CardContent>
          </TabsContent>
          <TabsContent value="occupationalHealthcareEntry">
            <CardContent>
              <Form {...occupationalHealthcareEntryForm}>
                <form
                  onSubmit={occupationalHealthcareEntryForm.handleSubmit(
                    onSubmit
                  )}
                  className="space-y-4"
                >
                  <FormField
                    name="date"
                    control={occupationalHealthcareEntryForm.control}
                    render={({ field }) => (
                      <FormItem className={cn("flex flex-col")}>
                        <FormLabel>Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  " pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="description"
                    control={occupationalHealthcareEntryForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Type the description here"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="diagnosisCodes"
                    control={occupationalHealthcareEntryForm.control}
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormItem className="mb-5">
                        <FormLabel>Diagnosis Codes</FormLabel>
                        <MultiSelect
                          selected={value || []}
                          options={diagnosesData}
                          onChange={(newValue) => {
                            onChange(newValue);
                          }}
                          {...field}
                        />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="employerName"
                    control={occupationalHealthcareEntryForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employer Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Employer Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-x-4">
                    <FormField
                      name="sickLeave.startDate"
                      control={occupationalHealthcareEntryForm.control}
                      render={({ field }) => (
                        <FormItem className={cn("flex flex-col")}>
                          <FormLabel>Sickleave Start Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-[240px] pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="sickLeave.endDate"
                      control={occupationalHealthcareEntryForm.control}
                      render={({ field }) => (
                        <FormItem className={cn("flex flex-col")}>
                          <FormLabel>Sickleave End Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-[240px] pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="border-b border-black/40 my-4" />

                  <FormField
                    name="specialist"
                    control={occupationalHealthcareEntryForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specialist</FormLabel>
                        <FormControl>
                          <Input placeholder="Speclist name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit">Submit</Button>
                </form>
              </Form>
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </>
  );
};

export default NewEntryForm;
