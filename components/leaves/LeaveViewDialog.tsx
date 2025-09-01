"use client";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Stack, Typography, Divider, Chip
} from "@mui/material";
import type { Leave } from "../../types/leave";
import { supabase } from "../../lib/supabaseClient";
import { useQueryClient } from "@tanstack/react-query";

function daysBetweenInclusive(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const d = Math.round((e.getTime() - s.getTime()) / 86400000);
  return d >= 0 ? d + 1 : 0;
}

export default function LeaveViewDialog({
  open,
  onClose,
  leave,
}: {
  open: boolean;
  onClose: () => void;
  leave: Leave | null;
}) {
  const qc = useQueryClient();

  if (!leave) return null;
  const days = daysBetweenInclusive(leave.start_date, leave.end_date);


  const handleDelete = async () => {
    if (!leave?.id) return;
    if (!confirm("Are you sure you want to delete this leave request?")) return;

    const { error } = await supabase.from("leaves").delete().eq("id", leave.id);

    if (error) {
      alert(" Failed to delete: " + error.message);
    } else {
      alert("🗑 Leave deleted!");
      qc.invalidateQueries({ queryKey: ["leaves"] });
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Leave Details</DialogTitle>
      <DialogContent>
        <Stack spacing={1.25} mt={0.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography fontWeight={700}>
              {leave.employee?.name ?? "Employee"}
            </Typography>
            <Chip
              size="small"
              label={leave.status}
              color={
                leave.status === "Approved" ? "success" :
                  leave.status === "Rejected" ? "error" : "default"
              }
              variant={leave.status === "Pending" ? "outlined" : "filled"}
            />
          </Stack>

          <Divider />

          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Department</Typography>
            <Typography>{leave.employee?.department ?? "-"}</Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Leave Type</Typography>
            <Typography>{leave.leave_type}</Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Start Date</Typography>
            <Typography>{leave.start_date}</Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">End Date</Typography>
            <Typography>{leave.end_date}</Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Number of Days</Typography>
            <Typography>{days}</Typography>
          </Stack>

          {leave.reason ? (
            <>
              <Divider />
              <Stack spacing={0.5}>
                <Typography color="text.secondary">Reason for Leave</Typography>
                <Typography whiteSpace="pre-wrap">{leave.reason}</Typography>
              </Stack>
            </>
          ) : null}
        </Stack>
      </DialogContent>


      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          onClick={handleDelete}
          sx={{ color: "red", textTransform: "none" }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
