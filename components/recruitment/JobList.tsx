"use client";

import { useMemo, useState, useEffect } from "react";
import { useJobs, useUpsertJob, useDeleteJob } from "../../hooks/useJobs";
import { useApplications } from "../../hooks/useApplications";
import {
  Card,
  CardContent,
  Stack,
  TextField,
  MenuItem,
  Button,
  Chip,
  IconButton,
  Typography,
  Box,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer,
  Badge,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Snackbar,
} from "@mui/material";
import MuiAlert, { AlertColor } from "@mui/material/Alert";
import { alpha } from "@mui/material/styles";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import styles from "../../styles/Table.module.css";
import type { Job } from "../../types/job";


const Alert = (props: any) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
};


function timeAgo(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hours ago`;
  const days = Math.floor(h / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function JobStatusChip({ status }: { status: "Open" | "Closed" | string }) {
  return (
    <Chip
      size="medium"
      label={status}
      variant="outlined"
      sx={(t) => {
        const base = {
          height: 26,
          borderWidth: 0,
          "& .MuiChip-label": { px: 1.25, fontSize: 13, fontWeight: 600 },
        } as const;
        if (status === "Open") {
          return {
            ...base,
            color: t.palette.success.main,
            backgroundColor: alpha(t.palette.success.main, 0.12),
          };
        }
        return {
          ...base,
          color: t.palette.error.main,
          backgroundColor: alpha(t.palette.error.main, 0.12),
        };
      }}
    />
  );
}

export default function JobList({
  forceOpenNewJob = false,
  onCloseNewJob,
}: {
  forceOpenNewJob?: boolean;
  onCloseNewJob?: () => void;
}) {
  const { data: jobs = [] } = useJobs();
  const { data: apps = [] } = useApplications();
  const upsert = useUpsertJob();
  const del = useDeleteJob();

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"" | "Open" | "Closed">("");
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<{ type: AlertColor; msg: string } | null>(
    null
  );

  const [form, setForm] = useState<Partial<Job>>({
    title: "",
    department: "Engineering",
    location: "",
    employment_type: "Full-time",
    description: "",
    status: "Open",
  });

  const [viewOpen, setViewOpen] = useState(false);
  const [currentJob, setCurrentJob] = useState<Job | null>(null);

  useEffect(() => {
    if (forceOpenNewJob) {
      resetForm();
      setOpen(true);
    }
  }, [forceOpenNewJob]);

  const handleClose = () => {
    setOpen(false);
    if (onCloseNewJob) onCloseNewJob();
  };

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    (apps as any[]).forEach((a) => {
      map.set(a.job_id, (map.get(a.job_id) || 0) + 1);
    });
    return map;
  }, [apps]);

  const rows = useMemo(() => {
    const qq = q.toLowerCase();
    return (jobs as Job[]).filter((j) => {
      const okQ =
        !qq ||
        j.title.toLowerCase().includes(qq) ||
        j.department.toLowerCase().includes(qq);
      const okS = !status || j.status === status;
      return okQ && okS;
    });
  }, [jobs, q, status]);

  const resetForm = () =>
    setForm({
      title: "",
      department: "Engineering",
      location: "",
      employment_type: "Full-time",
      description: "",
      status: "Open",
    });

  const save = async () => {
    if (!form.title || !form.department) return;
    await upsert.mutateAsync(form as Job);
    setToast({
      type: "success",
      msg: form?.id
        ? "Job updated successfully!"
        : "Job added successfully!",
    });
    handleClose();
    resetForm();
  };

  const openView = (j: Job) => {
    setCurrentJob(j);
    setViewOpen(true);
  };

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>

        <Stack
          className={styles.toolbar}
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <TextField
            size="small"
            placeholder="Search jobs..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            sx={{ width: 320 }}
            inputProps={{ style: { fontSize: 13.5 } }}
          />
          <Stack direction="row" spacing={1.25} alignItems="center">
            <TextField
              size="small"
              select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              sx={{ minWidth: 110, height: 34 }} // ✅ smaller
              SelectProps={{ displayEmpty: true }}
            >
              <MenuItem value="">
                <span style={{ color: "#94a3b8" }}>status</span>
              </MenuItem>
              <MenuItem value="Open">Open</MenuItem>
              <MenuItem value="Closed">Closed</MenuItem>
            </TextField>

            <Button
              size="small"
              variant="contained"
              onClick={() => {
                resetForm();
                setOpen(true);
              }}
              sx={{
                px: 1.75,
                py: 0.8,
                fontSize: 12.5,
                fontWeight: 500,
                backgroundColor: "#8597d0ff",
                color: "#fbf8f1ff",
                "&:hover": {
                  backgroundColor: "#5f6d9bff",
                },
              }}
            >
              + NEW JOB
            </Button>

          </Stack>
        </Stack>


        <Stack spacing={1.25} mt={1}>
          {rows.map((j) => (
            <Box
              key={j.id}
              sx={{
                borderRadius: 2,
                border: "1px solid #e5e7eb",
                p: 2,
                bgcolor: "background.paper",
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                gap={1.5}
              >
                <Stack spacing={0.25}>
                  <Typography fontWeight={700} sx={{ fontSize: 18 }}>
                    {j.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: 13 }}
                  >
                    {j.department} Department
                  </Typography>
                  <Stack direction="row" spacing={2} mt={0.5}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: 12 }}
                    >
                      {(counts.get(j.id) || 0) + ""} applicants
                    </Typography>
                    <Divider orientation="vertical" flexItem />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: 12 }}
                    >
                      {timeAgo(j.created_at)}
                    </Typography>
                  </Stack>
                </Stack>


                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box>
                    <JobStatusChip status={j.status} />
                  </Box>
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{ mx: 1 }}
                  />
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1.25}
                  >
                    <IconButton onClick={() => openView(j)} sx={{ ml: 0.5 }}>
                      <VisibilityOutlinedIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                    <IconButton
                      color="warning"
                      onClick={() => {
                        setForm(j);
                        setOpen(true);
                      }}
                    >
                      <EditOutlinedIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => {
                        del.mutate(j.id, {
                          onSuccess: () =>
                            setToast({
                              type: "success",
                              msg: "Job deleted successfully!",
                            }),
                        });
                      }}
                    >
                      <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Stack>
                </Stack>
              </Stack>
            </Box>
          ))}

          {rows.length === 0 && (
            <Typography color="text.secondary" sx={{ px: 1.5, py: 3 }}>
              No jobs match your filters.
            </Typography>
          )}
        </Stack>


        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontSize: 18 }}>
            {form?.id ? "Edit Job" : "Post New Job"}
          </DialogTitle>
          <DialogContent>
            <Stack mt={1.5} spacing={2}>
              <TextField
                label="Title"
                value={form.title || ""}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                fullWidth
              />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  select
                  fullWidth
                  label="Department"
                  value={form.department || "Engineering"}
                  onChange={(e) =>
                    setForm({ ...form, department: e.target.value })
                  }
                >
                  {[
                    "Engineering",
                    "Marketing",
                    "Sales",
                    "Finance",
                    "HR",
                    "Operations",
                  ].map((d) => (
                    <MenuItem key={d} value={d}>
                      {d}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  fullWidth
                  label="Location"
                  value={form.location || ""}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                  placeholder="Remote / City"
                />
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  select
                  fullWidth
                  label="Type"
                  value={form.employment_type || "Full-time"}
                  onChange={(e) =>
                    setForm({ ...form, employment_type: e.target.value })
                  }
                >
                  {["Full-time", "Part-time", "Contract", "Intern"].map(
                    (t) => (
                      <MenuItem key={t} value={t}>
                        {t}
                      </MenuItem>
                    )
                  )}
                </TextField>
                <TextField
                  select
                  fullWidth
                  label="Status"
                  value={form.status || "Open"}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as "Open" | "Closed",
                    })
                  }
                >
                  <MenuItem value="Open">Open</MenuItem>
                  <MenuItem value="Closed">Closed</MenuItem>
                </TextField>
              </Stack>
              <TextField
                label="Description"
                value={form.description || ""}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                multiline
                rows={4}
                placeholder="Write the role summary, responsibilities and requirements…"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button variant="contained" onClick={save} sx={{ px: 2 }}>
              Save
            </Button>
          </DialogActions>
        </Dialog>


        <Drawer
          anchor="right"
          open={viewOpen}
          onClose={() => setViewOpen(false)}
          PaperProps={{ sx: { width: 480 } }}
        >
          {currentJob && (
            <Box sx={{ p: 2 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="h6" fontWeight={700} sx={{ fontSize: 18 }}>
                  {currentJob.title}
                </Typography>
                <JobStatusChip status={currentJob.status} />
              </Stack>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                <strong>Department:</strong> {currentJob.department}
              </Typography>
              <Typography color="text.secondary">
                <strong>Type:</strong> {currentJob.employment_type}
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 1 }}>
                <strong>Location:</strong> {currentJob.location || "N/A"}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2">Description</Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ whiteSpace: "pre-wrap", mb: 2 }}
              >
                {currentJob.description || "No description provided."}
              </Typography>
              <Typography variant="subtitle2" mb={1}>
                Applicants{" "}
                <Badge
                  color="primary"
                  badgeContent={counts.get(currentJob.id) || 0}
                />
              </Typography>
              <List
                dense
                sx={{ bgcolor: "background.default", borderRadius: 1 }}
              >
                {(apps as any[])
                  .filter((a) => a.job_id === currentJob.id)
                  .map((a) => (
                    <ListItem key={a.id}>
                      <ListItemAvatar>
                        <Avatar sx={{ width: 28, height: 28, fontSize: 13 }}>
                          {(a.candidate_name || "?").charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primaryTypographyProps={{ sx: { fontSize: 13.5 } }}
                        secondaryTypographyProps={{ sx: { fontSize: 12 } }}
                        primary={a.candidate_name}
                        secondary={a.email}
                      />
                    </ListItem>
                  ))}
                {(apps as any[]).filter((a) => a.job_id === currentJob.id)
                  .length === 0 && (
                    <Typography
                      color="text.secondary"
                      variant="body2"
                      sx={{ p: 2 }}
                    >
                      No applicants yet.
                    </Typography>
                  )}
              </List>
            </Box>
          )}
        </Drawer>
      </CardContent>

      {toast && (
        <Snackbar
          open={true}
          autoHideDuration={2500}
          onClose={() => setToast(null)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            severity={toast.type as "success" | "error"}
            sx={{
              borderRadius: 2,
              backgroundColor:
                toast.type === "success"
                  ? "rgba(46, 125, 50, 0.8)"
                  : "rgba(211, 47, 47, 0.8)",
              color: "#fff",
              fontWeight: 600,
              backdropFilter: "blur(6px)",
            }}
          >
            {toast.msg}
          </Alert>
        </Snackbar>
      )}

    </Card>
  );
}
