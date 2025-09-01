// app/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";  
import KPIStats from "../../components/KPIStats";
import DepartmentPie from "../../components/charts/DepartmentPie";
import WeeklyActivityLine from "../../components/charts/WeeklyActivityLine";
import styles from "../../styles/Dashboard.module.css";

import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Stack,
  Button,

} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import SettingsIcon from "@mui/icons-material/Settings";
import EventNoteIcon from "@mui/icons-material/EventNote";
import Link from "next/link";

import { useEmployees } from "../../hooks/useEmployees";
import { useLeaves } from "../../hooks/useLeaves";
import { useApplications } from "../../hooks/useApplications";
import JobList from "../../components/recruitment/JobList";
import AddEmployeeDialog from "../../components/employees/AddEmployeeDialog";

import { useAuthUser } from "../../hooks/useAuthUser";


function timeAgo(iso: string) {
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hours ago`;
  const days = Math.floor(h / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default function DashboardPage() {
  const { data: employees = [] } = useEmployees();
  const { data: leaves = [] } = useLeaves();
  const { data: applications = [] } = useApplications();

  const [openAdd, setOpenAdd] = useState(false);
  const [openJobForm, setOpenJobForm] = useState(false);

  const user = useAuthUser(); 
  const router = useRouter();


  const feed: any[] = [];
  (employees as any[]).forEach((e) => {
    const when = e.created_at || e.join_date;
    if (when) {
      feed.push({
        id: `emp-${e.id}`,
        when,
        who: e.name,
        what: `joined the ${e.department} Department`,
        avatar: e.avatar_url || null,
      });
    }
  });
  (leaves as any[]).forEach((l) => {
    if (l.created_at) {
      const who = l.employee_name || l.employee?.name || "An employee";
      feed.push({ id: `leave-${l.id}`, when: l.created_at, who, what: "submitted a leave request" });
    }
  });
  (applications as any[]).forEach((a) => {
    if (a.created_at) {
      const jobTitle = a.job?.title || a.job_title || "a position";
      feed.push({
        id: `app-${a.id}`,
        when: a.created_at,
        who: a.candidate_name || a.name || "Candidate",
        what: `applied for ${jobTitle}`,
      });
    }
  });

  const rows = feed.sort((x, y) => new Date(y.when).getTime() - new Date(x.when).getTime()).slice(0, 4);

  return (
    <>
      <KPIStats />
      <div className={styles.row}>
        <WeeklyActivityLine />
        <DepartmentPie />
      </div>

      <div className={styles.bottom}>
      
        <Card className={styles.card}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography fontWeight={700}>Recent Employee Activity</Typography>
              <Link
                href={user ? "/employees" : "/login"}  
                style={{
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#2e528dff",
                }}
              >
                VIEW ALL
              </Link>
            </Stack>
            {rows.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 3 }}>
                No recent activity yet.
              </Typography>
            ) : (
              <List>
                {rows.map((r, i) => (
                  <ListItem key={r.id} divider={i < rows.length - 1}>
                    <ListItemAvatar>
                      <Avatar src={r.avatar || undefined}>{(r.who || "?").charAt(0)}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primaryTypographyProps={{ sx: { fontSize: 14.5 } }}
                      secondaryTypographyProps={{ sx: { fontSize: 12, color: "text.secondary" } }}
                      primary={`${r.who} ${r.what}`}
                      secondary={timeAgo(r.when)}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>

       
        {/* <Card className={styles.card}>
          <CardContent>
            <Typography fontWeight={700} mb={2}>Quick Actions</Typography>
            <Stack spacing={2} sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
              <Button
                variant="outlined"
                onClick={() => (user ? setOpenAdd(true) : router.push("/login"))}
                sx={{ display: "flex", flexDirection: "column", py: 2, borderStyle: "dashed", borderColor: "#cbd5e1" }}
              >
                <AddIcon sx={{ color: "#9d6eaaff", fontSize: 28 }} />
                <Typography variant="body2" fontWeight={600} mt={1}>Add Employee</Typography>
              </Button>

              <Button
                variant="outlined"
                onClick={() => (user ? setOpenJobForm(true) : router.push("/login"))}
                sx={{ display: "flex", flexDirection: "column", py: 2, borderStyle: "dashed", borderColor: "#cbd5e1" }}
              >
                <WorkOutlineIcon sx={{ color: "#5bb2c0ff", fontSize: 28 }} />
                <Typography variant="body2" fontWeight={600} mt={1}>Post Job</Typography>
              </Button>

              <Button
                variant="outlined"
                onClick={() => (user ? router.push("/settings") : router.push("/login"))}
                sx={{ display: "flex", flexDirection: "column", py: 2, borderStyle: "dashed", borderColor: "#cbd5e1" }}
              >
                <SettingsIcon sx={{ color: "#5bb2c0ff", fontSize: 28 }} />
                <Typography variant="body2" fontWeight={600} mt={1}>Profile</Typography>
              </Button>

              <Button
                variant="outlined"
                onClick={() => (user ? router.push("/leaves") : router.push("/login"))}
                sx={{ display: "flex", flexDirection: "column", py: 2, borderStyle: "dashed", borderColor: "#cbd5e1" }}
              >
                <EventNoteIcon sx={{ color: "#9d6eaaff", fontSize: 28 }} />
                <Typography variant="body2" fontWeight={600} mt={1}>Review Leaves</Typography>
              </Button>
            </Stack>
          </CardContent>
        </Card> */}



<Card className={styles.card}>
  <CardContent>
    <Typography fontWeight={700} mb={2}>Quick Actions</Typography>
    <Stack spacing={2} sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
      
      <Button
        variant="outlined"
        onClick={() => (user ? setOpenAdd(true) : router.push("/login"))}
        sx={{
          display: "flex",
          flexDirection: "column",
          py: 2,
          border: "none !important",         
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <AddIcon sx={{ color: "#9d6eaaff", fontSize: 28 }} />
        <Typography variant="body2" fontWeight={600} mt={1}>Add Employee</Typography>
      </Button>

      <Button
        variant="outlined"
        onClick={() => (user ? setOpenJobForm(true) : router.push("/login"))}
        sx={{
          display: "flex",
          flexDirection: "column",
          py: 2,
          border: "none !important",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <WorkOutlineIcon sx={{ color: "#5bb2c0ff", fontSize: 28 }} />
        <Typography variant="body2" fontWeight={600} mt={1}>Post Job</Typography>
      </Button>

      <Button
        variant="outlined"
        onClick={() => (user ? router.push("/settings") : router.push("/login"))}
        sx={{
          display: "flex",
          flexDirection: "column",
          py: 2,
          border: "none !important",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <SettingsIcon sx={{ color: "#5bb2c0ff", fontSize: 28 }} />
        <Typography variant="body2" fontWeight={600} mt={1}>Profile</Typography>
      </Button>

      <Button
        variant="outlined"
        onClick={() => (user ? router.push("/leaves") : router.push("/login"))}
        sx={{
          display: "flex",
          flexDirection: "column",
          py: 2,
          border: "none !important",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <EventNoteIcon sx={{ color: "#9d6eaaff", fontSize: 28 }} />
        <Typography variant="body2" fontWeight={600} mt={1}>Review Leaves</Typography>
      </Button>
    </Stack>
  </CardContent>
</Card>










        
      </div>

      
      <AddEmployeeDialog open={openAdd} onClose={() => setOpenAdd(false)} />
      {openJobForm && <JobList forceOpenNewJob={true} onCloseNewJob={() => setOpenJobForm(false)} />}
    </>
  );
}
