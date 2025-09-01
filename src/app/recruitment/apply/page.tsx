"use client";

import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Stack,
  Button,
} from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import type { AlertColor } from "@mui/material";


import { useJobs } from "../../../../hooks/useJobs";
import { useApply } from "../../../../hooks/useApplications";
import { supabase } from "../../../../lib/supabaseClient";

export default function PublicApplyPage() {
  const { data: jobs = [], isLoading: jobsLoading } = useJobs() as any;
  const apply = useApply();

  type Notice = { type: AlertColor; msg: string } | null;
  const [notice, setNotice] = useState<Notice>(null);

  const [form, setForm] = useState({
    job_id: "",
    candidate_name: "",
    email: "",
    phone: "",
    skills: "",
    cover_letter: "",
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.job_id) return setNotice({ type: "error", msg: "Please select a job opening." });
    if (!form.candidate_name) return setNotice({ type: "error", msg: "Please enter your name." });
    if (!form.email) return setNotice({ type: "error", msg: "Please enter your email." });

    if (resumeFile) {
      const okType = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ].includes(resumeFile.type);
      const okSize = resumeFile.size <= 10 * 1024 * 1024;
      if (!okType) return setNotice({ type: "error", msg: "Resume must be PDF/DOC/DOCX." });
      if (!okSize) return setNotice({ type: "error", msg: "Resume must be ≤ 10 MB." });
    }

    try {
    
      let resume_url: string | null = null;
      if (resumeFile) {
        const bucket = process.env.NEXT_PUBLIC_SUPABASE_CV_BUCKET!;
        const fileName = `${Date.now()}_${resumeFile.name}`;
        const { data: up, error: upErr } = await supabase.storage
          .from(bucket)
          .upload(fileName, resumeFile);
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from(bucket).getPublicUrl(up.path);
        resume_url = pub.publicUrl;
      }

      await apply.mutateAsync({
        job_id: form.job_id,
        candidate_name: form.candidate_name,
        email: form.email,
        phone: form.phone || null,
        cover_letter: form.cover_letter || null,
        skills: form.skills || null,
        resume_url,
      } as any);

      setNotice({ type: "success", msg: "Application submitted successfully!" });
      setForm({
        job_id: "",
        candidate_name: "",
        email: "",
        phone: "",
        skills: "",
        cover_letter: "",
      });
      setResumeFile(null);
    } catch (err: any) {
      console.error(err);
      setNotice({ type: "error", msg: err?.message || "Failed to submit application." });
    }
  };

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", mt: 4, mb: 6, px: 2 }}>
      <Typography variant="h4" fontWeight={800} mb={2}>
        Apply for a Job
      </Typography>
      <Typography color="text.secondary" mb={3}>
        Select an open position and submit your application with a resume.
      </Typography>

      <Card>
        <CardContent>
          <form onSubmit={onSubmit}>
            <Stack spacing={2.5}>
              <TextField
                select
                label="Open Position"
                value={form.job_id}
                onChange={(e) => setForm({ ...form, job_id: e.target.value })}
                required
                disabled={!!jobsLoading}
              >
                {(jobs as any[])
                  .filter((j) => j.status === "Open")
                  .map((j) => (
                    <MenuItem key={j.id} value={j.id}>
                      {j.title} — {j.department}
                    </MenuItem>
                  ))}
              </TextField>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Full Name"
                  value={form.candidate_name}
                  onChange={(e) => setForm({ ...form, candidate_name: e.target.value })}
                  required
                  fullWidth
                />
                <TextField
                  type="email"
                  label="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  fullWidth
                />
              </Stack>

              <TextField
                label="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />

              <TextField
                label="Skills (comma separated)"
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
                placeholder="React, Node.js, SQL"
              />

              <TextField
                label="Cover Letter"
                value={form.cover_letter}
                onChange={(e) => setForm({ ...form, cover_letter: e.target.value })}
                multiline
                minRows={4}
              />

              <Button variant="outlined" component="label">
                {resumeFile ? "Replace Resume" : "Upload Resume (PDF/DOC/DOCX)"}
                <input
                  hidden
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
                />
              </Button>
              {resumeFile && (
                <Typography variant="body2" color="text.secondary">
                  Selected: {resumeFile.name}
                </Typography>
              )}

              <Stack direction="row" justifyContent="flex-end" spacing={1.5} mt={1}>
                <Button type="submit" variant="contained" disabled={!!apply.isPending}>
                  {apply.isPending ? "Submitting..." : "Submit Application"}
                </Button>
              </Stack>
            </Stack>
          </form>
        </CardContent>
      </Card>

    
      <Snackbar
        open={!!notice}
        autoHideDuration={3500}
        onClose={() => setNotice(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {notice ? (
          <Alert onClose={() => setNotice(null)} severity={notice.type} sx={{ width: "100%" }}>
            {notice.msg}
          </Alert>
        ) : null}
      </Snackbar>
    </Box>
  );
}
