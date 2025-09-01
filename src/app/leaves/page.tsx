// src/app/leaves/page.tsx
"use client";
import { useState } from "react";
import LeaveTable from "../../../components/leaves/LeaveTable";
import ApplyLeaveDialog from "../../../components/leaves/ApplyLeaveDialog";
import { Card, CardContent, Stack, Button, Tabs, Tab, Typography } from "@mui/material";

export default function LeavesPage() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"All" | "Pending" | "Approved" | "Rejected">("All");

  return (
    <>
      <Card>
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography fontWeight={700}>Leave Management</Typography>
            <Stack direction="row" spacing={1}>

              <Button
                variant="contained"
                onClick={() => setOpen(true)}
                sx={{
                  backgroundColor:"#8597d0ff",
                  color: "#fbf8f1ff",
                  fontWeight: 500,
                  "&:hover": {
                    backgroundColor: "#586695ff",
                    color: "#ffffff",
                  },
                }}
              >
                Apply for Leave
              </Button>

            </Stack>
          </Stack>

          <Tabs
            sx={{ mt: 1 }}
            value={tab}
            onChange={(_, v) => setTab(v)}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab value="All" label="All Requests" />
            <Tab value="Pending" label="Pending" />
            <Tab value="Approved" label="Approved" />
            <Tab value="Rejected" label="Rejected" />
          </Tabs>
        </CardContent>
      </Card>

      <div style={{ marginTop: 16 }}>
        <LeaveTable tab={tab} />
      </div>

      <ApplyLeaveDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
