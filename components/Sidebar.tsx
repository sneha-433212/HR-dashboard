"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../styles/Sidebar.module.css";

import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import TimelineIcon from "@mui/icons-material/Timeline";
import ApartmentIcon from "@mui/icons-material/Apartment";
import BarChartIcon from "@mui/icons-material/BarChart";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";

import clsx from "clsx";
import SidebarFooter from "./SidebarFooter";


import { useAuthUser } from "../hooks/useAuthUser";


const LOGO_URL = "https://cdn-icons-png.flaticon.com/512/3135/3135768.png";


const mainItems = [
  { href: "/", label: "Dashboard", icon: <DashboardIcon fontSize="small" /> },
  { href: "/employees", label: "Employees", icon: <PeopleAltIcon fontSize="small" /> },
  { href: "/leaves", label: "Leave Management", icon: <EventAvailableIcon fontSize="small" /> },
  { href: "/recruitment", label: "Recruitment", icon: <WorkOutlineIcon fontSize="small" /> },
];

const chartItems = [
  { href: "/charts/tenure", label: "Tenure", icon: <TimelineIcon fontSize="small" /> },
  { href: "/charts/department", label: "Department", icon: <ApartmentIcon fontSize="small" /> },
  { href: "/charts/performance", label: "Performance", icon: <BarChartIcon fontSize="small" /> },
];

const otherItems = [
  { href: "/settings", label: "Profile", icon: <AccountCircleOutlinedIcon fontSize="small" /> },
];

export default function Sidebar() {
  const path = usePathname();
  const user = useAuthUser();

  return (
    <aside className={styles.sidebar}>

      <div className={styles.logo}>
        <img src={LOGO_URL} alt="HR" width="34" height="34" style={{ objectFit: "contain" }} />
        <span
          style={{
            fontWeight: 800,
            fontSize: "20px",
            color: "#2d517cff",
            marginLeft: "4px",
            textShadow: "1px 1px 2px rgba(161, 146, 146, 0.2)",
          }}
        >
          HRMS
        </span>
      </div>


      <div className={styles.sectionLabel}>MAIN</div>
      <nav className={styles.menu}>
        {mainItems.map((it) => (
          <Link
            key={it.href}
            href={user ? it.href : "/login"}
            className={clsx(styles.item, path === it.href && styles.active)}
          >
            {it.icon}
            <span>{it.label}</span>
          </Link>
        ))}
      </nav>


      <div className={styles.sectionLabel}>CHARTS</div>
      <nav className={styles.menu}>
        {chartItems.map((it) => (
          <Link
            key={it.href}
            href={user ? it.href : "/login"}
            className={clsx(styles.item, path === it.href && styles.active)}
          >
            {it.icon}
            <span>{it.label}</span>
          </Link>
        ))}
      </nav>


      <div className={styles.sectionLabel}>OTHER</div>
      <nav className={styles.menu}>
        {otherItems.map((it) => (
          <Link
            key={it.href}
            href={user ? it.href : "/login"}
            className={clsx(styles.item, path === it.href && styles.active)}
          >
            {it.icon}
            <span>{it.label}</span>
          </Link>
        ))}
      </nav>


      <SidebarFooter />
    </aside>
  );
}
