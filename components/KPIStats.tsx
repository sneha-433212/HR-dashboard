"use client";
import { Card, CardContent, Typography, Stack } from "@mui/material";
import Groups2Outlined from "@mui/icons-material/Groups2Outlined";
import WorkOutline from "@mui/icons-material/WorkOutline";
import EventBusyOutlined from "@mui/icons-material/EventBusyOutlined";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import styles from "../styles/Dashboard.module.css";

import { useEmployees } from "../hooks/useEmployees";
import { useLeaves } from "../hooks/useLeaves";
import { useJobs } from "../hooks/useJobs";
import { useApplications } from "../hooks/useApplications";

export default function KPIStats() {
  const { data: employees = [] } = useEmployees();
  const { data: leaves = [] } = useLeaves();
  const { data: jobs = [] } = useJobs();
  const { data: applications = [] } = useApplications();


  const thisMonthEmployees = employees.filter(
    (e: any) =>
      e.join_date &&
      new Date(e.join_date).getMonth() === new Date().getMonth()
  ).length;
  const lastMonthEmployees = employees.filter(
    (e: any) =>
      e.join_date &&
      new Date(e.join_date).getMonth() === new Date().getMonth() - 1
  ).length;
  const empGrowth =
    lastMonthEmployees > 0
      ? (((thisMonthEmployees - lastMonthEmployees) / lastMonthEmployees) * 100).toFixed(1)
      : thisMonthEmployees > 0
        ? "+100"
        : "0";


  const urgentJobs = jobs.filter((j: any) => j.status === "Open" && j.priority === "High").length;


  const urgentLeaves = leaves.filter(
    (l: any) => l.status === "Pending" && new Date(l.start_date) <= new Date()
  ).length;


  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - 7);
  const newAppsThisWeek = applications.filter(
    (a: any) => a.status === "New" && new Date(a.created_at) >= startOfWeek
  ).length;

  const KPIS = [
    {
      label: "Total Employees",
      value: employees.length,
      icon: <Groups2Outlined />,
      trend: `${empGrowth}% from last month`,
      trendClass: styles.kpiTrendUp,
      colorClass: styles.kpiEmployees,
      headingClass: styles.kpiHeadingEmployees,
    },
    {
      label: "Open Positions",
      value: jobs.filter((j: any) => j.status === "Open").length,
      icon: <WorkOutline />,
      trend: `${urgentJobs} urgent need attention`,
      trendClass: urgentJobs > 0 ? styles.kpiTrendWarn : styles.kpiTrendUp,
      colorClass: styles.kpiJobs,
      headingClass: styles.kpiHeadingJobs,
    },
    {
      label: "Pending Leaves",
      value: leaves.filter((l: any) => l.status === "Pending").length,
      icon: <EventBusyOutlined />,
      trend: `${urgentLeaves} urgent require approval`,
      trendClass: urgentLeaves > 0 ? styles.kpiTrendWarn : styles.kpiTrendUp,
      colorClass: styles.kpiLeaves,
      headingClass: styles.kpiHeadingLeaves,
    },
    {
      label: "New Applications",
      value: applications.filter((a: any) => a.status === "New").length,
      icon: <DescriptionOutlined />,
      trend: `+${newAppsThisWeek} this week`,
      trendClass: newAppsThisWeek > 0 ? styles.kpiTrendUp : styles.kpiTrendWarn,
      colorClass: styles.kpiApplications,
      headingClass: styles.kpiHeadingApplications,
    },
  ];


  return (
    <div className={styles.grid}>
      {KPIS.map((k) => (
        <Card key={k.label} className={styles.card}>
          <CardContent>
            <Stack direction="row" className={styles.kpi}>
              <div>
                <Typography fontWeight={600} className={k.headingClass}>
                  {k.label}
                </Typography>

                <div className={styles.kpiValue}>{k.value}</div>
                <div className={`${styles.kpiTrend} ${k.trendClass}`}>{k.trend}</div>
              </div>
              <div className={`${styles.kpiIconWrapper} ${k.colorClass}`}>
                {k.icon}
              </div>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
