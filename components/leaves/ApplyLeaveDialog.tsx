"use client";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Stack, TextField, MenuItem
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useEmployees } from "../../hooks/useEmployees";
import { useCreateLeave } from "../../hooks/useLeaves";

type Props = { open: boolean; onClose: () => void; };

export default function ApplyLeaveDialog({ open, onClose }: Props) {
  const { data: employees = [] } = useEmployees();
  const create = useCreateLeave();


  const [employeeName, setEmployeeName] = useState<string>("");
  const [employeeId, setEmployeeId] = useState<string>("");

  const [leaveType, setLeaveType] =
    useState<"Casual" | "Sick" | "Annual" | "Personal">("Annual");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [reason, setReason] = useState<string>("");


  useEffect(() => {
    if (open) {
      setEmployeeName("");
      setEmployeeId("");
      setLeaveType("Annual");
      setStartDate("");
      setEndDate("");
      setReason("");
    }
  }, [open]);

  const days = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diff = Math.round((e.getTime() - s.getTime()) / 86400000);
    return diff >= 0 ? diff + 1 : 0;
  }, [startDate, endDate]);

  const submit = async () => {
    if (!employeeName.trim()) return alert("Please enter an employee name.");
    if (!startDate || !endDate) return alert("Please choose start and end dates.");


    let eid = employeeId;
    const found = employees.find((e) => e.name.toLowerCase() === employeeName.toLowerCase());
    if (found) eid = found.id;

    if (!eid) return alert("Employee not found in system.");

    try {
      await create.mutateAsync({
        employee_id: eid,
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        reason: reason?.trim() || null,
      });
      onClose();
    } catch (err: any) {
      alert(err?.message ?? "Failed to submit leave request.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Apply for Leave</DialogTitle>
      <DialogContent>
        <Stack mt={1} spacing={2}>

          <TextField
            label="Employee Name"
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
            fullWidth
          />

          <TextField
            select
            label="Leave Type"
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value as any)}
          >
            {["Casual", "Sick", "Annual", "Personal"].map((t) => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </TextField>

          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              type="date"
              label="Start Date"
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <TextField
              fullWidth
              type="date"
              label="End Date"
              InputLabelProps={{ shrink: true }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Stack>

          <TextField
            label="Number of Days"
            value={days}
            InputProps={{ readOnly: true }}
          />

          <TextField
            label="Reason for Leave"
            placeholder="Enter reason for leave"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            multiline
            minRows={2}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={create.isPending}>
          {create.isPending ? "Submitting..." : "Submit Request"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
