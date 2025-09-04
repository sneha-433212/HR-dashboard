"use client";
import styles from "../../styles/Table.module.css";
import { useMemo, useState } from "react";
import { useEmployees, useDeleteEmployee } from "../../hooks/useEmployees";
import {
  Card,
  CardContent,
  TextField,
  MenuItem,
  Stack,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Pagination,
  Button,
  Tooltip,
  Chip,
  InputAdornment,
} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SearchIcon from "@mui/icons-material/Search";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../lib/store";
import {
  setEmpDept,
  setEmpSearch,
  setEmpStatus,
  setEmpPage,
} from "../../slices/uiSlice";
import type { Employee } from "../../types/employee";
import AddEmployeeDialog from "./AddEmployeeDialog";
import EditEmployeeDialog from "./EditEmployeeDialog";
import Link from "next/link";


function monthsBetween(aIso: string, bIso: string) {
  const a = new Date(aIso);
  const b = new Date(bIso);
  let months =
    (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (b.getDate() < a.getDate()) months -= 1;
  return Math.max(0, months);
}

function formatTenure(months: number) {
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y && m) return `${y}y ${m}m`;
  if (y) return `${y}y`;
  return `${m}m`;
}

function performanceColor(p?: number | null) {
  if (!p) return "default" as const;
  if (p >= 80) return "success" as const;
  if (p >= 50) return "warning" as const;
  return "error" as const;
}

export default function EmployeeTable() {
  const dispatch = useDispatch();
  const ui = useSelector((s: RootState) => s.ui);

  const [openAdd, setOpenAdd] = useState(false);
  const [editEmp, setEditEmp] = useState<Employee | null>(null);

  const { data: all = [] } = useEmployees();
  const del = useDeleteEmployee();

  const filtered = useMemo(() => {
    const q = ui.empSearch.toLowerCase();
    return all.filter((e) => {
      const okQ =
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q);
      const okDept = ui.empDept === "All" || e.department === ui.empDept;
      const okStatus =
        ui.empStatus === "All" || (e.status || "Active") === ui.empStatus;
      return okQ && okDept && okStatus;
    });
  }, [all, ui]);

  const pageStart = (ui.empPage - 1) * ui.empPageSize;
  const pageRows = filtered.slice(pageStart, pageStart + ui.empPageSize);
  const pageCount = Math.max(1, Math.ceil(filtered.length / ui.empPageSize));

  return (
    <Card>
      <CardContent>

        <Stack
          direction="row"
          className={styles.toolbar}
          justifyContent="space-between"
          alignItems="center"
          spacing={1.5}
        >

          <TextField
            placeholder="Search employees..."
            size="small"
            value={ui.empSearch}
            onChange={(e) => dispatch(setEmpSearch(e.target.value))}
            sx={{ width: 320, background: "#ffffff" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: "#9ca3af" }} />
                </InputAdornment>
              ),
            }}
          />


          <Stack direction="row" spacing={1.5} alignItems="center">
            <TextField
              size="small"
              select
              value={ui.empDept}
              onChange={(e) => dispatch(setEmpDept(e.target.value))}
              label="All Departments"
              sx={{ minWidth: 160, background: "#fff" }}
            >
              {[
                "All",
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
              size="small"
              select
              value={ui.empStatus}
              onChange={(e) => dispatch(setEmpStatus(e.target.value))}
              label="All Status"
              sx={{ minWidth: 140, background: "#fff" }}
            >
              {["All", "Active", "On Leave", "Inactive"].map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
            <Button
              variant="contained"
              onClick={() => setOpenAdd(true)}
              sx={{
                backgroundColor: "#8597d0ff",
                color: "#fbf8f1ff",
                fontWeight: 500,
                "&:hover": {
                  backgroundColor: "#5f6d9bff",
                  color: "#ffffff",
                },
              }}
            >
              + Add Employee
            </Button>


          </Stack>
        </Stack>

       
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Join Date</TableCell>
                <TableCell>Tenure</TableCell>
                <TableCell>Performance</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pageRows.map((e) => {
                const months =
                  e.tenure_months != null
                    ? e.tenure_months
                    : monthsBetween(e.join_date, new Date().toISOString());
                return (
                  <TableRow key={e.id}>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          src={e.avatar_url || undefined}
                          sx={{ width: 32, height: 32 }}
                        >
                          {e.name?.[0]}
                        </Avatar>
                        <div>
                          <div style={{ fontWeight: 600 }}>{e.name}</div>
                          <div style={{ fontSize: 12, color: "#64748b" }}>
                            {e.email}
                          </div>
                        </div>
                      </Stack>
                    </TableCell>
                    <TableCell>{e.department}</TableCell>
                    <TableCell>{e.role}</TableCell>
                    <TableCell>
                      <span
                        className={[
                          styles.status,
                          (e.status || "Active") === "Active" &&
                          styles.statusActive,
                          (e.status || "Active") === "On Leave" &&
                          styles.statusLeave,
                          (e.status || "Active") === "Inactive" &&
                          styles.statusRejected,
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {e.status || "Active"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(e.join_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{formatTenure(months)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={e.performance ?? "-"}
                        color={performanceColor(e.performance)}
                        variant="outlined" 
                        sx={{
                          backgroundColor: "rgba(0,0,0,0.04)", 
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Link
                          href={`/employees/${e.id}`}
                          style={{ display: "inline-flex" }}
                          aria-label={`View ${e.name}`}
                        >
                          <Tooltip title="View">
                            <IconButton color="primary">
                               <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        </Link>
                        <Tooltip title="Edit">
                          <IconButton
                            color="warning"
                            onClick={() => setEditEmp(e)}
                          >
                             <EditOutlinedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            color="error"
                            onClick={() => del.mutate(e.id)}
                          >
                             <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
              {pageRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

       
        <Stack alignItems="flex-end" mt={2}>
          <Pagination
            count={pageCount}
            page={ui.empPage}
            onChange={(_, p) => dispatch(setEmpPage(p))}
            shape="rounded"
          />
        </Stack>
      </CardContent>

     
      <AddEmployeeDialog open={openAdd} onClose={() => setOpenAdd(false)} />
      {editEmp && (
        <EditEmployeeDialog
          open={!!editEmp}
          onClose={() => setEditEmp(null)}
          employee={editEmp}
        />
      )}
    </Card>
  );
}
