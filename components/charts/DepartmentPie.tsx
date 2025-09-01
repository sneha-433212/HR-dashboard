"use client";
import { Card, CardContent, Typography } from "@mui/material";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { useEmployees } from "../../hooks/useEmployees";

const COLORS = ["#7f39abff", "#5486c6ff", " #1b0d9673", " #e3b2d1ff", "#ebf0c9ff", "#659ff1ff"];

export default function DepartmentPie() {
  const { data: employees = [] } = useEmployees();
  const byDept: Record<string, number> = {};
  employees.forEach((e) => { byDept[e.department] = (byDept[e.department] || 0) + 1; });

  const data = Object.entries(byDept).map(([name, value]) => ({ name, value }));

  return (
    <Card>
      <CardContent>
        <Typography
          fontWeight={700}
          mb={2}
          sx={{ color: "#0e0e0fff" }}
        >
          Department Distribution
        </Typography>

        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" outerRadius={110}>
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend
                formatter={(value) => {
                  const customColors: Record<string, string> = {
                    Engineering: "#453d3aff",
                    Finance: "#212622ff",
                    HR: "#1e2022ff",
                    Marketing: "#241f21ff",
                    Operations: "#1b181bff",
                    Sales: "#1e1d1aff",
                  };

                  return (
                    <span style={{ color: customColors[value] || "#000", fontWeight: 500 }}>
                      {value}
                    </span>
                  );
                }}
              />

            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

