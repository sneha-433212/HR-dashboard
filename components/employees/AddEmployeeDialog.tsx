"use client";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Stack, TextField, MenuItem
} from "@mui/material";
import { useState } from "react";
import { useUpsertEmployee } from "../../hooks/useEmployees";

export default function AddEmployeeDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const upsert = useUpsertEmployee();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    department: "Engineering",
    join_date: "",
    status: "Active",
    address: "",
    dob: "",
    tenure_months: "",
    performance: "",

    skills: "",
    experience: "",
    qualifications: "",
    blood_group: "",
    emergency_contact: "",
    avatar_url: "",
  });
  const [cvFile, setCvFile] = useState<File | null>(null);


  const save = async () => {
    // assign random avatar if not set
    const randomAvatar =
      form.avatar_url ||
      `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`;

    await upsert.mutateAsync({
      ...form,
      avatar_url: randomAvatar,
      tenure_months: form.tenure_months === "" ? null : Number(form.tenure_months),
      performance: form.performance === "" ? null : Number(form.performance),
      cv_file: cvFile ?? undefined,
    } as any);
    onClose();
  };


  const handleExtract = async () => {
    try {
      if (!cvFile) {
        alert("Please upload a CV first.");
        return;
      }

      const fd = new FormData();
      fd.append("file", cvFile);

      const resp = await fetch("/api/extract-cv", {
        method: "POST",
        body: fd,
      });

      const data = await resp.json();

      if (!resp.ok) {
        console.error("extract-cv failed:", data);
        alert(`Auto-extract failed: ${data?.error || "Unknown error"}`);
        return;
      }

      setForm((f) => ({
        ...f,
        role: f.role || data.role || "",
        skills: data.skills ?? f.skills,
        experience: data.experience ?? f.experience,
        qualifications: data.qualifications ?? f.qualifications,
        blood_group: data.blood_group ?? f.blood_group,
        emergency_contact: data.emergency_contact ?? f.emergency_contact,
      }));

      alert("✅ CV parsed and fields filled.");
    } catch (err) {
      console.error("extract-cv error:", err);
      alert("Auto-extract failed due to a network/server error.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Employee</DialogTitle>
      <DialogContent>
        <Stack mt={1} spacing={2}>
          <TextField
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <TextField
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <TextField
            label="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />

          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              label="Role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            />
            <TextField
              fullWidth
              select
              label="Department"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            >
              {["Engineering", "Marketing", "Sales", "Finance", "HR", "Operations"].map(
                (d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                )
              )}
            </TextField>
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              type="date"
              label="Join Date"
              InputLabelProps={{ shrink: true }}
              value={form.join_date}
              onChange={(e) => setForm({ ...form, join_date: e.target.value })}
            />
            <TextField
              fullWidth
              type="date"
              label="DOB"
              InputLabelProps={{ shrink: true }}
              value={form.dob}
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              select
              label="Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {["Active", "On Leave", "Inactive"].map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              type="number"
              label="Tenure (months)"
              value={form.tenure_months}
              onChange={(e) => setForm({ ...form, tenure_months: e.target.value })}
            />
            <TextField
              fullWidth
              select
              label="Performance"
              value={form.performance}
              onChange={(e) => setForm({ ...form, performance: e.target.value })}
            >
              <MenuItem value="">-</MenuItem>
              {Array.from({ length: 100 }, (_, i) => i + 1).map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Button component="label" variant="outlined">
            Upload CV
            <input
              hidden
              type="file"
              onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
            />
          </Button>
          {cvFile && (
            <div style={{ fontSize: 12, color: "#64748b" }}>
              Selected: {cvFile.name}
            </div>
          )}

          <Button variant="contained" onClick={handleExtract}>
            Auto Extract from CV
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={save}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
