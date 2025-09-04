"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Button,
  Stack,
  Chip,
  Tooltip,
  Drawer,
  Box,
  Divider,
  IconButton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import { useApplications, useUpdateApplicationStatus } from "../../hooks/useApplications";
import { supabase } from "../../lib/supabaseClient";
import { useQueryClient } from "@tanstack/react-query";

type AppStatus = "New" | "Received" | "Shortlisted" | "Rejected" | "Hired";

const needsReview = (s?: string | null) => s === "New" || s === "Received" || !s;

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

function StatusChip({ status }: { status?: string }) {
  if (!status) return null;
  const normalized = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  return (
    <Chip
      size="small"
      label={normalized}
      variant="outlined"
      sx={(t) => {
        const base = {
          fontSize: 11,
          height: 22,
          borderWidth: 0,
          fontWeight: 600,
        } as const;

        if (normalized === "Shortlisted") {
          return {
            ...base,
            color: t.palette.success.main,
            backgroundColor: alpha(t.palette.success.main, 0.12),
          };
        }
        if (normalized === "Rejected") {
          return {
            ...base,
            color: t.palette.error.main,
            backgroundColor: alpha(t.palette.error.main, 0.12),
          };
        }
        if (normalized === "Hired") {
          return {
            ...base,
            color: t.palette.primary.main,
            backgroundColor: alpha(t.palette.primary.main, 0.12),
          };
        }
        return {
          ...base,
          color: t.palette.text.secondary,
          backgroundColor: alpha(t.palette.text.primary, 0.06),
        };
      }}
    />
  );
}

const avatarColors = ["#1976d2", "#2e7d32", "#ed6c02", "#9c27b0", "#d32f2f", "#0288d1"];

export default function RecentApplications() {
  const { data: apps = [], isLoading } = useApplications();
  const updateStatus = useUpdateApplicationStatus();
  const qc = useQueryClient();

  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [current, setCurrent] = useState<any>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const list = useMemo(() => (apps as any[]).slice(0, 6), [apps]);

  const openReview = (a: any) => {
    setCurrent(a);
    setOpen(true);
  };

  const openDialog = (a: any) => {
    setCurrent(a);
    setDialogOpen(true);
  };

  async function setStatus(s: AppStatus) {
    if (!current) return;
    try {
      setBusy(true);
      await updateStatus.mutateAsync({ id: current.id, status: s as any });
      setToast({ type: "success", msg: `Status updated to ${s}.` });


      setCurrent({ ...current, status: s });


      qc.invalidateQueries({ queryKey: ["applications"] });
    } catch (e: any) {
      setToast({ type: "error", msg: e?.message || "Failed to update status." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card sx={{ height: "100%", mr: 0 }}>
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography fontWeight={700}>Recent Applications</Typography>
          <Button size="small" href="/recruitment">VIEW ALL</Button>
        </Stack>

        {isLoading ? (
          <Typography color="text.secondary">Loading…</Typography>
        ) : list.length === 0 ? (
          <Typography color="text.secondary">No recent applications.</Typography>
        ) : (
          <List sx={{ py: 0 }}>
            {list.map((a: any, i: number) => {
              const reviewable = needsReview(a.status);
              return (
                <ListItem
                  key={a.id}
                  divider
                  sx={{ pr: 14 }}
                  secondaryAction={
                    <Stack direction="row" spacing={1} alignItems="center">
                      {reviewable ? (
                        <Tooltip title="Open review panel">
                          <span>
                            <Button
                              variant="contained"
                              disableElevation
                              sx={{
                                px: 2,
                                py: 0.5,
                                fontSize: 14,
                                fontWeight: 500,
                                textTransform: "none",
                                backgroundColor: "#5062a1ff",
                                color: "#ffffff",
                                "&:hover": {
                                  backgroundColor: "#456d8aff",
                                  color: "#fff",
                                }
                              }
                              }
                              onClick={() => openReview(a)}
                            >
                              Review
                            </Button>
                          </span>
                        </Tooltip>
                      ) : (
                        <StatusChip status={a.status} />
                      )}
                    </Stack>
                  }
                >
                  <ListItemAvatar>
                    <Avatar
                      src={a.avatar_url || undefined}
                      onClick={() => openDialog(a)}
                      sx={{ cursor: "pointer", bgcolor: avatarColors[i % avatarColors.length] }}
                    >
                      {(a.candidate_name || "?").charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<span style={{ textTransform: "capitalize" }}>{a.candidate_name}</span>}
                    secondary={
                      <span>
                        Applied for {a.job?.title || "Unknown"} • {a.job?.department || ""}
                        {" · "}
                        <span style={{ color: "#64748b" }}>{timeAgo(a.created_at)}</span>
                      </span>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        )}
      </CardContent>


      <Drawer anchor="right" open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { width: 420 } }}>
        <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6" fontWeight={700}>Review Application</Typography>
          <IconButton onClick={() => setOpen(false)}><CloseIcon /></IconButton>
        </Box>
        <Divider />
        {current && (
          <Box sx={{ p: 2 }}>
            <Stack spacing={1}>
              <Typography fontWeight={700} sx={{ textTransform: "capitalize" }}>
                {current.candidate_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">{current.email}</Typography>
              <Typography variant="body2" color="text.secondary">
                Applied for: {current.job?.title || "-"} • {current.job?.department || "-"}
              </Typography>
              <StatusChip status={current.status || "New"} />
              <Divider sx={{ my: 1.5 }} />

              {current.skills && (
                <Box>
                  <Typography variant="subtitle2">Skills</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-wrap" }}>
                    {current.skills}
                  </Typography>
                </Box>
              )}

              {current.cover_letter && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mt: 1 }}>Cover Letter</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-wrap" }}>
                    {current.cover_letter}
                  </Typography>
                </Box>
              )}

              {current.resume_url && (
                <Button
                  variant="outlined"
                  size="small"
                  href={current.resume_url}
                  target="_blank"
                  rel="noreferrer"
                  sx={{ fontSize: 12, px: 2, py: 0.4, alignSelf: "flex-start" }}
                >
                  OPEN CV
                </Button>
              )}


              <Stack direction="row" spacing={1} justifyContent="center" mt={2}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setStatus("Shortlisted")}
                  disabled={busy || current.status?.toLowerCase() === "shortlisted"}
                  sx={{
                    borderColor: "green",
                    color: "green",
                    backgroundColor: "rgba(0,128,0,0.08)",
                    fontSize: 12,
                    px: 2,
                  }}
                >
                  Shortlist
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setStatus("Rejected")}
                  disabled={busy || current.status?.toLowerCase() === "rejected"}
                  sx={{
                    borderColor: "red",
                    color: "red",
                    backgroundColor: "rgba(255,0,0,0.08)",
                    fontSize: 12,
                    px: 2,
                  }}
                >
                  Reject
                </Button>
              </Stack>
            </Stack>
          </Box>
        )}
      </Drawer>


      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Application Details
          <IconButton onClick={() => setDialogOpen(false)} sx={{ position: "absolute", right: 12, top: 12 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {current && (
            <Stack spacing={2}>
              <Typography fontWeight={700}>{current.candidate_name}</Typography>
              <Typography variant="body2">{current.email}</Typography>
              <Typography variant="body2">{current.job?.title} • {current.job?.department}</Typography>
              {current.skills && <Typography variant="body2">Skills: {current.skills}</Typography>}

              {current.resume_url && (
                <Button
                  variant="outlined"
                  size="small"
                  href={current.resume_url}
                  target="_blank"
                  rel="noreferrer"
                  sx={{
                    fontSize: 12,
                    px: 2,
                    py: 0.4,
                    alignSelf: "flex-start",
                    border: "none",              
                    boxShadow: "none",           
                    "&:hover": {
                      border: "none",            
                      backgroundColor: "rgba(0,0,0,0.04)", 
                    },
                  }}
                >
                  OPEN CV
                </Button>

              )}

              <Button
                variant="outlined"
                size="small"
                onClick={async () => {
                  if (!current?.id) return;
                  const { error } = await supabase.from("applications").delete().eq("id", current.id);
                  if (error) {
                    alert(" Failed to delete: " + error.message);
                  } else {
                    alert("🗑 Applicant deleted!");
                    setDialogOpen(false);
                    qc.invalidateQueries({ queryKey: ["applications"] });
                  }
                }}
                sx={{ borderColor: "red", color: "red", backgroundColor: "rgba(255,0,0,0.08)", fontSize: 12, px: 2 }}
              >
                Delete Applicant
              </Button>
            </Stack>
          )}
        </DialogContent>
      </Dialog>


      {toast && (
        <Snackbar
          open={true}
          autoHideDuration={2000}
          onClose={() => setToast(null)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setToast(null)}
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
