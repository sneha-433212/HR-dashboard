"use client";
import styles from "../styles/Navbar.module.css";

import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Divider from "@mui/material/Divider";
import {
  Drawer,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
} from "@mui/material";
import { ListItemButton } from "@mui/material";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";
import WorkOutline from "@mui/icons-material/WorkOutline";
import EventBusyOutlined from "@mui/icons-material/EventBusyOutlined";
import CloseIcon from "@mui/icons-material/Close";

import { useApplications } from "../hooks/useApplications";
import { useLeaves } from "../hooks/useLeaves";


function stringToColor(string: string) {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ("00" + value.toString(16)).slice(-2);
  }
  return color;
}

export default function Navbar() {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const open = Boolean(anchorEl);

  const handleAvatarClick = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    handleClose();
    router.push("/login");
  };

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);
    };
    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);


  const { data: apps = [] } = useApplications();
  const { data: leaves = [] } = useLeaves();

  const newApps = (apps as any[]).filter(
    (a) => a.status === "New" || a.status === "Received"
  );
  const newLeaves = (leaves as any[]).filter((l) => l.status === "Pending");
  const notifCount = newApps.length + newLeaves.length;

  return (
    <div className={styles.nav}>


      <div
        className={styles.brand}
        style={{
          fontWeight: 700,
          fontSize: "1.1rem",
          color: "#726587ff",
        }}
      >
        {user ? "Welcome to Dashboard" : "Dashboard"}
      </div>


      <div className={styles.actions}>
        {user ? (
          <>

            <IconButton onClick={() => setNotifOpen(true)}>
              <Badge badgeContent={notifCount} color="error">
                <NotificationsNoneIcon />
              </Badge>
            </IconButton>
            
            <Drawer
              anchor="right"
              open={notifOpen}
              onClose={() => setNotifOpen(false)}
              PaperProps={{ sx: { width: 360, p: 2 } }}
            >

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6" fontWeight={700}>
                  Notifications
                </Typography>
                <IconButton onClick={() => setNotifOpen(false)} size="small">
                  <CloseIcon />
                </IconButton>
              </div>
              <Divider sx={{ my: 1.5 }} />

              {notifCount === 0 && (
                <Typography
                  color="text.secondary"
                  sx={{ textAlign: "center", mt: 4 }}
                >
                  No new notifications
                </Typography>
              )}

              <List>
                {newApps.map((a: any) => (
                  <ListItem disablePadding key={a.id}>
                    <ListItemButton
                      onClick={() => {
                        router.push("/recruitment");
                        setNotifOpen(false);
                      }}
                    >
                      <ListItemIcon>
                        <WorkOutline color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${a.candidate_name} applied for ${a.job?.title || "a job"
                          }`}
                        secondary="New application"
                      />
                    </ListItemButton>
                  </ListItem>
                ))}

                {newLeaves.map((l: any) => (
                  <ListItem disablePadding key={l.id}>
                    <ListItemButton
                      onClick={() => {
                        router.push("/leaves");
                        setNotifOpen(false);
                      }}
                    >
                      <ListItemIcon>
                        <EventBusyOutlined color="error" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${l.employee_name || "Employee"
                          } requested leave`}
                        secondary="Pending approval"
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Drawer>


            <Tooltip title={user.email || "Admin"}>
              <Avatar
                alt="Admin"
                sx={{
                  width: 36,
                  height: 36,
                  cursor: "pointer",
                  bgcolor: stringToColor(
                    user.user_metadata?.full_name ||
                    user.user_metadata?.name ||
                    user.email ||
                    "U"
                  ),
                }}
                onClick={handleAvatarClick}
              >
                {(
                  user.user_metadata?.full_name?.[0] ||
                  user.user_metadata?.name?.[0] ||
                  user.email?.[0] ||
                  "U"
                ).toUpperCase()}
              </Avatar>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >

              <MenuItem
                onClick={() => {
                  handleClose();
                  router.push("/settings");
                }}
              >
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Button
            variant="outlined"
            onClick={() => router.push("/login")}
            sx={{
              backgroundColor: "#fff",
              borderColor: "#f2f2e9ff",
              color: "#4c1d95",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#e7d9eaff",
                borderColor: "#8c7b99ff",
              },
            }}
          >
            Login
          </Button>
        )}
      </div>
    </div>
  );
}
