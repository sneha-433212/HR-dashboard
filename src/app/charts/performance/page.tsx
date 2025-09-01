"use client";
import { Card, CardContent, Typography } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useEmployees } from "../../../../hooks/useEmployees";

export default function PerformanceChartPage() {
  const { data: employees = [] } = useEmployees();


  const avgPerformance =
    employees.length > 0
      ? Math.round(
          employees.reduce((sum, e) => sum + (e.performance ?? 0), 0) /
            employees.length
        )
      : 0;


  const ranges = [
    { name: "Below Par", value: 25, color: "#1e3a8a" }, 
    { name: "Bad", value: 25, color: "#3b82f6" },
    { name: "Normal", value: 25, color: "#8b5cf6" },
    { name: "Good", value: 25, color: "#e879f9" }, 
  ];

  return (
    <Card>
      <CardContent style={{ textAlign: "center" }}>
        <Typography variant="h6" gutterBottom>
          Employee Performance Gauge
        </Typography>

        <div style={{ width: "100%", height: 300, position: "relative" }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={ranges}
                startAngle={180}
                endAngle={0}
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
              >
                {ranges.map((r, i) => (
                  <Cell key={i} fill={r.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

        
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: `rotate(${avgPerformance * 1.8 - 90}deg)`,
              transformOrigin: "bottom center",
              height: "90px",
              width: "2px",
              background: "#000",
            }}
          />

         
          <Typography
            variant="h4"
            style={{ position: "absolute", top: "65%", left: "50%", transform: "translate(-50%, -50%)" }}
          >
            {avgPerformance}
          </Typography>
        </div>

      
        <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-around" }}>
          {ranges.map((r) => (
            <div key={r.name} style={{ fontSize: 12 }}>
              <span
                style={{
                  display: "inline-block",
                  width: 12,
                  height: 12,
                  background: r.color,
                  borderRadius: "50%",
                  marginRight: 6,
                }}
              />
              {r.name}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
