"use client";
import styles from "../../styles/Table.module.css";
import {
  Card, CardContent, Table, TableHead, TableRow, TableCell, TableBody,
  Avatar, Stack, Button, Box, Typography
} from "@mui/material";
import CalendarMonthOutlined from "@mui/icons-material/CalendarMonthOutlined";
import { useLeaves, useUpdateLeaveStatus } from "../../hooks/useLeaves";
import { useState } from "react";
import LeaveViewDialog from "./LeaveViewDialog";
import type { Leave } from "../../types/leave";

function daysInclusive(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const diff = Math.round((e.getTime() - s.getTime()) / 86400000);
  return diff >= 0 ? diff + 1 : 0;
}

export default function LeaveTable({
  tab = "All",
}: {
  tab?: "All" | "Pending" | "Approved" | "Rejected";
}) {
  const { data: rows = [] } = useLeaves(tab);
  const update = useUpdateLeaveStatus();

  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState<Leave | null>(null);

  const openView = (row: Leave) => {
    setSelected(row);
    setViewOpen(true);
  };

  const emptyTitle =
    tab === "Pending"
      ? "No Pending Requests"
      : tab === "Approved"
      ? "No Approved Requests"
      : tab === "Rejected"
      ? "No Rejected Requests"
      : "No Leave Requests";

  const emptySubtitle =
    tab === "Pending"
      ? "All leave requests have been processed."
      : "There are no records to show.";

  return (
    <>
      <Card>
        <CardContent>
          <Table sx={{ fontSize: 14 }}> 
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: 14, fontWeight: 600 }}>Employee</TableCell>
                <TableCell sx={{ fontSize: 14, fontWeight: 600 }}>Leave Type</TableCell>
                <TableCell sx={{ fontSize: 14, fontWeight: 600 }}>Start Date</TableCell>
                <TableCell sx={{ fontSize: 14, fontWeight: 600 }}>End Date</TableCell>
                <TableCell sx={{ fontSize: 14, fontWeight: 600 }}>Days</TableCell>
                <TableCell sx={{ fontSize: 14, fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontSize: 14, fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Box
                      sx={{
                        py: 6,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Stack spacing={1} alignItems="center">
                        <CalendarMonthOutlined sx={{ fontSize: 50, color: "#94a3b8" }} />
                        <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: 15 }}>
                          {emptyTitle}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
                          {emptySubtitle}
                        </Typography>
                      </Stack>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => {
                  const days = daysInclusive(r.start_date, r.end_date);
                  const isPending = r.status === "Pending";
                  return (
                    <TableRow key={r.id} sx={{ fontSize: 14 }}>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar
                            src={r.employee?.avatar_url || undefined}
                            sx={{ width: 30, height: 30, fontSize: 14 }}
                          >
                            {r.employee?.name?.[0]}
                          </Avatar>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>{r.employee?.name}</div>
                            <div style={{ fontSize: 13, color: "#64748b" }}>
                              {r.employee?.department}
                            </div>
                          </div>
                        </Stack>
                      </TableCell>

                      <TableCell sx={{ fontSize: 14 }}>
                        <span
                          className={[
                            styles.tag,
                            r.leave_type === "Annual"   && styles.tagAnnual,
                            r.leave_type === "Sick"     && styles.tagSick,
                            r.leave_type === "Casual"   && styles.tagCasual,
                            r.leave_type === "Personal" && styles.tagPersonal,
                          ].filter(Boolean).join(" ")}
                          style={{ fontSize: 13, padding: "2px 6px" }}
                        >
                          {r.leave_type}
                        </span>
                      </TableCell>

                      <TableCell sx={{ fontSize: 14 }}>{r.start_date}</TableCell>
                      <TableCell sx={{ fontSize: 14 }}>{r.end_date}</TableCell>
                      <TableCell sx={{ fontSize: 14 }}>{days}</TableCell>

                      <TableCell>
                        <span
                          className={[
                            styles.status,
                            r.status === "Pending" && styles.statusPending,
                            r.status === "Approved" && styles.statusApproved,
                            r.status === "Rejected" && styles.statusRejected,
                          ].filter(Boolean).join(" ")}
                          style={{ fontSize: 13, padding: "2px 6px" }}
                        >
                          {r.status}
                        </span>
                      </TableCell>

                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          {isPending && (
                            <>
                              <Button
                                size="small"
                                onClick={() =>
                                  update.mutate({ id: r.id, status: "Approved" })
                                }
                                sx={{
                                  border: "none",
                                  color: "green",
                                  backgroundColor: "rgba(0,128,0,0.08)",
                                  fontSize: 13,
                                  px: 1.8,
                                  py: 0.5,
                                }}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                onClick={() =>
                                  update.mutate({ id: r.id, status: "Rejected" })
                                }
                                sx={{
                                  border: "none",
                                  color: "red",
                                  backgroundColor: "rgba(0,41, 37, 37, 1)",
                                  fontSize: 13,
                                  px: 1.8,
                                  py: 0.5,
                                }}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => openView(r)}
                            sx={{ fontSize: 13 }}
                          >
                            View
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <LeaveViewDialog
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        leave={selected}
      />
    </>
  );
}




