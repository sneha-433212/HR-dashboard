"use client";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Stack, TextField, MenuItem
} from "@mui/material";
import { useEffect, useState } from "react";
import { useUpsertEmployee } from "../../hooks/useEmployees";
import type { Employee, EmployeeStatus } from "../../types/employee";

export default function EditEmployeeDialog({
  open,
  onClose,
  employee,
}: {
  open: boolean;
  onClose: () => void;
  employee: Employee;
}) {
  const upsert = useUpsertEmployee();


  const [form, setForm] = useState<{
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    department: string;
    join_date: string;
    status: EmployeeStatus;
    address: string;
    dob: string;
    tenure_months: number | "" | null;
    performance: number | "" | null;

    skills: string;
    experience: string;
    qualifications: string;
    blood_group: string;
    emergency_contact: string;
  }>({
    id: employee.id,
    name: employee.name,
    email: employee.email,
    phone: employee.phone || "",
    role: employee.role,
    department: employee.department,
    join_date: employee.join_date?.slice(0, 10) || "",
    status: (employee.status as EmployeeStatus) || "Active",
    address: employee.address || "",
    dob: employee.dob?.slice(0, 10) || "",
    tenure_months: employee.tenure_months ?? "",
    performance: employee.performance ?? "",
    skills: employee.skills || "",
    experience: employee.experience || "",
    qualifications: employee.qualifications || "",
    blood_group: employee.blood_group || "",
    emergency_contact: employee.emergency_contact || "",
  });

  const [cvFile, setCvFile] = useState<File | null>(null);

  useEffect(() => {
    if (!employee) return;
    setForm({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      phone: employee.phone || "",
      role: employee.role,
      department: employee.department,
      join_date: employee.join_date?.slice(0, 10) || "",
      status: (employee.status as EmployeeStatus) || "Active",
      address: employee.address || "",
      dob: employee.dob?.slice(0, 10) || "",
      tenure_months: employee.tenure_months ?? "",
      performance: employee.performance ?? "",
      skills: employee.skills || "",
      experience: employee.experience || "",
      qualifications: employee.qualifications || "",
      blood_group: employee.blood_group || "",
      emergency_contact: employee.emergency_contact || "",
    });
  }, [employee]);

const save = async () => {
  await upsert.mutateAsync({
    ...form,
    tenure_months: form.tenure_months === "" ? null : Number(form.tenure_months),
    performance: form.performance === "" ? null : Number(form.performance),
    cv_file: cvFile ?? employee.cv_url ?? undefined, // ✅ keep existing CV if no new one uploaded
  } as any);
  onClose();
};



  const handleExtract = async () => {
    try {
      if (!cvFile) {
        alert("Please choose a CV file (Replace CV) first.");
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
      <DialogTitle>Edit Employee</DialogTitle>
      <DialogContent>
        <Stack mt={1} spacing={2}>
          <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <TextField label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <TextField label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />

          <Stack direction="row" spacing={2}>
            <TextField fullWidth label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
            <TextField fullWidth select label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
              {["Engineering", "Marketing", "Sales", "Finance", "HR", "Operations"].map(d => (<MenuItem key={d} value={d}>{d}</MenuItem>))}
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
            <TextField fullWidth select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as EmployeeStatus })}>
              {["Active", "On Leave", "Inactive"].map(s => (<MenuItem key={s} value={s}>{s}</MenuItem>))}
            </TextField>
            <TextField
              fullWidth
              type="number"
              label="Tenure (months)"
              value={form.tenure_months}
              onChange={(e) => setForm({
                ...form,
                tenure_months: e.target.value === "" ? "" : Number(e.target.value)
              })}
              inputProps={{ min: 0 }}
            />
            <TextField
              fullWidth
              select
              label="Performance"
              value={form.performance}
              onChange={(e) => setForm({
                ...form,
                performance: e.target.value === "" ? "" : Number(e.target.value)
              })}
            >
              <MenuItem value="">-</MenuItem>
              {Array.from({ length: 100 }, (_, i) => i + 1).map(n => (
                <MenuItem key={n} value={n}>{n}</MenuItem>
              ))}
            </TextField>
          </Stack>

          <Button component="label" variant="outlined">
            Replace CV
            <input hidden type="file" onChange={(e) => setCvFile(e.target.files?.[0] ?? null)} />
          </Button>
          {cvFile && <div style={{ fontSize: 12, color: "#64748b" }}>Selected: {cvFile.name}</div>}

          <Button variant="contained" onClick={handleExtract}>Auto Extract from CV</Button>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={save}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
