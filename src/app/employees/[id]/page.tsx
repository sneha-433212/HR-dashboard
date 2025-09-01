"use client";
import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEmployee } from "../../../../hooks/useEmployees";
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Stack,
  Typography,
  Chip,
  Divider,
  Grid,
  Button,
  Link as MUILink,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PhoneIcon from "@mui/icons-material/Phone";
import BadgeIcon from "@mui/icons-material/Badge";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import BloodtypeIcon from "@mui/icons-material/Bloodtype";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";

function monthsBetween(aIso: string, bIso: string) {
  const a = new Date(aIso);
  const b = new Date(bIso);
  let m =
    (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (b.getDate() < a.getDate()) m -= 1;
  return Math.max(0, m);
}
function formatTenure(m: number) {
  const y = Math.floor(m / 12);
  const mo = m % 12;
  if (y && mo) return `${y}y ${mo}m`;
  if (y) return `${y}y`;
  return `${mo}m`;
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start">
      <Box sx={{ mt: 0.25 }}>{icon}</Box>
      <Box>
        <Typography variant="subtitle2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body2">{value || "-"}</Typography>
      </Box>
    </Stack>
  );
}

export default function EmployeeProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { data: e } = useEmployee(id);
  const [tab, setTab] = useState<"info" | "docs">("info");
  const router = useRouter();

  const tenureStr = useMemo(() => {
    if (!e?.join_date) return "-";
    const m = monthsBetween(e.join_date, new Date().toISOString());
    return formatTenure(m);
  }, [e?.join_date]);

  if (!e) return null;

  const perfColor: "success" | "warning" | "error" | "default" =
    e?.performance != null
      ? e.performance >= 4
        ? "success"
        : e.performance === 3
        ? "warning"
        : "error"
      : "default";

  const skillChips = (e.skills || "")
    .split(/[,|]/g)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <Card>
      <CardContent>
        
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="subtitle1" color="text.secondary">
            Employee Details
          </Typography>
          <IconButton onClick={() => router.push("/employees")}>
            <ArrowBackIcon />
          </IconButton>
        </Stack>

        
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          sx={{ flexWrap: "wrap" }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ width: 64, height: 64 }}>{e.name?.[0]}</Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {e.name}
              </Typography>
              <Typography color="text.secondary">{e.role}</Typography>
              <Stack direction="row" spacing={1} mt={1}>
                <Chip size="small" label={e.department || "-"} />
                <Chip
                  size="small"
                  label={e.status || "Active"}
                  color={
                    (e.status || "Active") === "Active" ? "success" : "warning"
                  }
                />
                <Chip
                  size="small"
                  label={`Performance: ${e.performance ?? "-"}`}
                  color={perfColor}
                />
                <Chip size="small" label={`Tenure: ${tenureStr}`} />
              </Stack>
            </Box>
          </Stack>

          <Stack
            spacing={1}
            alignItems="flex-end"
            sx={{ mt: { xs: 2, md: 0 }, minWidth: { md: 420, lg: 520 } }}
          >
            <Stack
              direction="row"
              spacing={3}
              alignItems="center"
              justifyContent="flex-end"
              flexWrap="wrap"
              sx={{ width: "100%" }}
            >
              <Stack direction="row" spacing={1.25} alignItems="center">
                <MailOutlineIcon fontSize="small" />
                <Typography variant="body2">{e.email}</Typography>
              </Stack>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <PhoneIcon fontSize="small" />
                <Typography variant="body2">{e.phone || "-"}</Typography>
              </Stack>
            </Stack>
            <Stack
              direction="row"
              spacing={3}
              alignItems="center"
              justifyContent="flex-end"
              flexWrap="wrap"
              sx={{ width: "100%" }}
            >
              <Stack direction="row" spacing={1.25} alignItems="center">
                <BadgeIcon fontSize="small" />
                <Typography variant="body2">ID: {e.id}</Typography>
              </Stack>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <CalendarMonthIcon fontSize="small" />
                <Typography variant="body2">
                  Joined:{" "}
                  {e.join_date
                    ? new Date(e.join_date).toLocaleDateString()
                    : "-"}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Stack>

        <Divider sx={{ my: 4 }} />

        
        <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              p: 0.5,
              borderRadius: "999px",
              bgcolor: "action.hover",
              boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.04)",
              gap: 1.25,
            }}
          >
            <Button
              onClick={() => setTab("info")}
              disableElevation
              sx={{
                borderRadius: "999px",
                px: 3,
                minWidth: 200,
                fontWeight: 700,
                textTransform: "none",
                bgcolor:
                  tab === "info" ? "action.selected" : "background.paper",
                color: "text.primary",
                boxShadow: tab === "info" ? "none" : 1,
              }}
            >
              Personal Info
            </Button>

            <Button
              onClick={() => setTab("docs")}
              disableElevation
              sx={{
                borderRadius: "999px",
                px: 3,
                minWidth: 220,
                fontWeight: 700,
                textTransform: "none",
                bgcolor:
                  tab === "docs" ? "action.selected" : "background.paper",
                color: "text.primary",
                boxShadow: tab === "docs" ? "none" : 1,
              }}
            >
              Documents &amp; Skills
            </Button>
          </Box>
        </Box>

        
        {tab === "info" ? (
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                Personal Information
              </Typography>
              <Box
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2.5,
                  p: 2.5,
                }}
              >
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={{ xs: 2.5, md: 4 }}
                  alignItems="stretch"
                >
                  <Stack flex={1} spacing={2.5}>
                    <InfoRow
                      icon={<CalendarMonthIcon fontSize="small" />}
                      label="Date of Birth"
                      value={
                        e.dob ? new Date(e.dob).toLocaleDateString() : "-"
                      }
                    />
                    <InfoRow
                      icon={<ContactPhoneIcon fontSize="small" />}
                      label="Emergency Contact"
                      value={e.emergency_contact || "-"}
                    />
                  </Stack>
                  <Divider
                    flexItem
                    orientation="vertical"
                    sx={{ display: { xs: "none", md: "block" } }}
                  />
                  <Stack flex={1} spacing={2.5}>
                    <InfoRow
                      icon={<LocationOnIcon fontSize="small" />}
                      label="Address"
                      value={e.address || "-"}
                    />
                    <InfoRow
                      icon={<BloodtypeIcon fontSize="small" />}
                      label="Blood Group"
                      value={e.blood_group || "-"}
                    />
                  </Stack>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
          
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2.5,
                  p: 2.5,
                  height: "100%",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Skills
                </Typography>
                {skillChips.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No skills
                  </Typography>
                ) : (
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {skillChips.map((s, i) => (
                      <Chip key={i} size="small" label={s} variant="outlined" />
                    ))}
                  </Stack>
                )}

                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Education
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {e.qualifications || "No qualifications"}
                </Typography>
              </Box>
            </Grid>

           
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2.5,
                  p: 2.5,
                  height: "100%",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Documents
                </Typography>
                {e.cv_url ? (
                  <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                    <InsertDriveFileOutlinedIcon fontSize="small" />
                    <Box>
                      <MUILink
                        href={e.cv_url}
                        target="_blank"
                        rel="noreferrer"
                        underline="hover"
                        sx={{ fontWeight: 600 }}
                      >
                        {decodeURIComponent(
                          e.cv_url.split("/").pop() || "Resume.pdf"
                        )}
                      </MUILink>
                      <Typography variant="body2" color="text.secondary">
                        Uploaded:{" "}
                        {e.cv_uploaded_at
                          ? new Date(String(e.cv_uploaded_at)).toLocaleDateString()
                          : "-"}
                      </Typography>
                    </Box>
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No document
                  </Typography>
                )}

                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Achievements
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {e.experience || "No achievements"}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
}
