"use client";
import { Box } from "@mui/material";
import JobList from "../../../components/recruitment/JobList";
import RecentApplications from "../../../components/recruitment/RecentApplications";

export default function RecruitmentPage() {
  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        gap: 2,
      }}
    >

      <Box sx={{ flex: 2 }}>
        <JobList />
      </Box>


      <Box sx={{ flex: 1 }}>
        <RecentApplications />
      </Box>
    </Box>
  );
}
