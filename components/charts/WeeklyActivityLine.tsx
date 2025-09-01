"use client";

import { Card, CardContent, Typography } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useEmployees } from "../../hooks/useEmployees";


function monthsBetween(aIso: string, bIso: string) {
  const a = new Date(aIso);
  const b = new Date(bIso);
  let m = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (b.getDate() < a.getDate()) m -= 1;
  return Math.max(0, m);
}

export default function WeeklyActivityLine() {
  const { data: employees = [] } = useEmployees();

  const nowIso = new Date().toISOString();
  const byDept = new Map<string, { sum: number; count: number }>();

  employees.forEach((e: any) => {
    const dept = e.department || "Unknown";

    let tenureMonths: number | null =
      e.tenure_months != null ? Number(e.tenure_months) : (e.join_date ? monthsBetween(e.join_date, nowIso) : null);
    if (tenureMonths == null || Number.isNaN(tenureMonths)) return;

    const acc = byDept.get(dept) ?? { sum: 0, count: 0 };
    acc.sum += tenureMonths;
    acc.count += 1;
    byDept.set(dept, acc);
  });


  const data = Array.from(byDept.entries())
    .map(([department, { sum, count }]) => ({
      department,
      avgTenureMonths: count ? +(sum / count).toFixed(1) : 0,
      headcount: count,
    }))

    .sort((a, b) => a.department.localeCompare(b.department));

  const hasData = data.length > 0;

  return (
    <Card>
      <CardContent>
        <Typography fontWeight={700} mb={2}>
          Average Tenure by Department
        </Typography>

        <div style={{ width: "100%", height: 280 }}>
          {hasData ? (
            <ResponsiveContainer>
              <LineChart data={data}>
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip
                  formatter={(value: any, name: any, props: any) => {
                    if (name === "avgTenureMonths") return [`${value} mo`, "Avg Tenure"];
                    if (name === "headcount") return [value, "Headcount"];
                    return [value, name];
                  }}
                  labelFormatter={(label) => `Dept: ${label}`}
                />
                <Legend />
                <Line type="monotone" dataKey="avgTenureMonths" name="Avg Tenure (months)" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Typography color="text.secondary" align="center" sx={{ mt: 8 }}>
              No tenure data yet.
            </Typography>
          )}
        </div>

        {hasData && (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
            Tooltip shows average tenure in months and headcount per department.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
