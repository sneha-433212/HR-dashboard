"use client";
import { useParams } from "next/navigation";
import { useJob } from "../../../../../hooks/useJobs";
import { useApply } from "../../../../../hooks/useApplications";
import {
  Card, CardContent, Stack, Typography, TextField, Button
} from "@mui/material";
import { useState } from "react";

export default function ApplyJobPage() {
  const { id } = useParams<{ id: string }>();
  const { data: job } = useJob(id);
  const apply = useApply();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    cover_letter: "",
  });
  const [file, setFile] = useState<File | null>(null);

  if (!job) return null;

  const submit = async () => {
    await apply.mutateAsync({
      job_id: job.id,
      name: form.name,
      email: form.email,
      phone: form.phone,
      cover_letter: form.cover_letter,
      resume_file: file ?? undefined,
    } as any);
    alert("✅ Application submitted!");
    setForm({ name:"", email:"", phone:"", cover_letter:"" });
    setFile(null);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" fontWeight={700}>{job.title}</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {job.department} • {job.location} • {job.employment_type}
        </Typography>
        <Typography sx={{ whiteSpace: "pre-wrap", mb: 3 }}>{job.description}</Typography>

        <Stack spacing={2} maxWidth={520}>
          <TextField label="Full Name" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})}/>
          <TextField type="email" label="Email" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})}/>
          <TextField label="Phone" value={form.phone} onChange={(e)=>setForm({...form, phone:e.target.value})}/>
          <TextField label="Cover Letter" multiline rows={4} value={form.cover_letter} onChange={(e)=>setForm({...form, cover_letter:e.target.value})}/>
          <Button component="label" variant="outlined">
            Upload Resume
            <input hidden type="file" onChange={(e)=>setFile(e.target.files?.[0] ?? null)} />
          </Button>
          {file && <div style={{fontSize:12, color:"#64748b"}}>Selected: {file.name}</div>}

          <Button variant="contained" onClick={submit} sx={{ mt: 1 }}>Apply</Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
