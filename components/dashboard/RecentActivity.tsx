// "use client";

// import {
//   Card, CardContent, Stack, Typography, Avatar, Divider, Link as MUILink
// } from "@mui/material";
// import Link from "next/link";
// import { useEmployees } from "../../hooks/useEmployees";
// import { useLeaves } from "../../hooks/useLeaves";
// import { useApplications } from "../../hooks/useApplications";

// type Item = {
//   id: string;
//   who: string;
//   what: string;
//   when: Date;
//   href: string;
//   initial: string;
// };

// function timeAgo(d: Date) {
//   const diff = Date.now() - d.getTime();
//   const m = Math.floor(diff / 60000);
//   if (m < 60) return `${m} ${m === 1 ? "minute" : "minutes"} ago`;
//   const h = Math.floor(m / 60);
//   if (h < 24) return `${h} ${h === 1 ? "hour" : "hours"} ago`;
//   const days = Math.floor(h / 24);
//   return `${days} day${days === 1 ? "" : "s"} ago`;
// }

// export default function RecentActivity() {
//   const { data: employees = [] } = useEmployees();
//   const { data: leaves = [] } = useLeaves();
//   const { data: apps = [] } = useApplications();

//   const items: Item[] = [];

//   // Joined
//   (employees as any[]).forEach((e) => {
//     if (!e?.join_date) return;
//     items.push({
//       id: `emp-${e.id}`,
//       who: e.name || "New employee",
//       what: `joined the ${e.department} Department`,
//       when: new Date(e.join_date),
//       href: `/employees/${e.id}`,
//       initial: (e.name || "?").charAt(0).toUpperCase(),
//     });
//   });

//   // Leave submitted
//   (leaves as any[]).forEach((l) => {
//     const when = l?.created_at ? new Date(l.created_at) : new Date(l.start_date);
//     items.push({
//       id: `leave-${l.id}`,
//       who: l.employee_name || "An employee",
//       what: "submitted a leave request",
//       when,
//       href: `/leaves`,
//       initial: (l.employee_name || "?").charAt(0).toUpperCase(),
//     });
//   });

//   // Job application submitted
//   (apps as any[]).forEach((a) => {
//     if (!a?.created_at) return;
//     items.push({
//       id: `app-${a.id}`,
//       who: a.candidate_name || a.name || "Candidate",
//       what: "applied for a job",
//       when: new Date(a.created_at),
//       href: `/recruitment`,
//       initial: (a.candidate_name || a.name || "?").charAt(0).toUpperCase(),
//     });
//   });

//   items.sort((a, b) => b.when.getTime() - a.when.getTime());
//   const list = items.slice(0, 4);

//   return (
//     <Card>
//       <CardContent>
//         <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
//           <Typography fontWeight={700}>Recent Employee Activity</Typography>
//           <MUILink component={Link} href="/employees" underline="hover" sx={{ fontSize: 13 }}>
//             VIEW ALL
//           </MUILink>
//         </Stack>

//         <Stack divider={<Divider flexItem />} spacing={2}>
//           {list.map((it) => (
//             <Stack key={it.id} direction="row" spacing={2} alignItems="center" py={0.5}>
//               <Avatar sx={{ width: 36, height: 36, fontSize: 16 }}>{it.initial}</Avatar>
//               <Stack sx={{ flex: 1 }}>
//                 <Typography variant="body2">
//                   <MUILink component={Link} href={it.href} underline="hover" sx={{ fontWeight: 600 }}>
//                     {it.who}
//                   </MUILink>{" "}
//                   {it.what}
//                 </Typography>
//                 <Typography variant="caption" color="text.secondary">
//                   {timeAgo(it.when)}
//                 </Typography>
//               </Stack>
//             </Stack>
//           ))}

//           {list.length === 0 && (
//             <Typography color="text.secondary" sx={{ py: 2 }}>
//               No recent activity yet.
//             </Typography>
//           )}
//         </Stack>
//       </CardContent>
//     </Card>
//   );
// }

"use client";

import {
  Card, CardContent, Stack, Typography, Avatar, Divider, Link as MUILink
} from "@mui/material";
import Link from "next/link";
import { useEmployees } from "../../hooks/useEmployees";
import { useLeaves } from "../../hooks/useLeaves";
import { useApplications } from "../../hooks/useApplications";

type Item = {
  id: string;
  who: string;
  what: string;
  when: Date;
  href: string;
  initial: string;
};

function timeAgo(d: Date) {
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hours ago`;
  const days = Math.floor(h / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default function RecentActivity() {
  const { data: employees = [] } = useEmployees();
  const { data: leaves = [] } = useLeaves();
  const { data: apps = [] } = useApplications();

  const items: Item[] = [];

  (employees as any[]).forEach((e) => {
    if (!e?.join_date) return;
    const name = e.name || "Employee";
    items.push({
      id: `emp-${e.id}`,
      who: name,
      what: `joined the ${e.department} Department`,
      when: new Date(e.join_date),
      href: `/employees/${e.id}`,
      initial: String(name).charAt(0).toUpperCase(),
    });
  });

  (leaves as any[]).forEach((l) => {
    const when = l?.created_at ? new Date(l.created_at) : (l?.start_date ? new Date(l.start_date) : null);
    if (!when) return;
    const name = l.employee_name || "Employee";
    items.push({
      id: `leave-${l.id}`,
      who: name,
      what: "submitted a leave request",
      when,
      href: `/leaves`,
      initial: String(name).charAt(0).toUpperCase(),
    });
  });

  (apps as any[]).forEach((a) => {
    if (!a?.created_at) return;
    const name = a.candidate_name || a.name || "Candidate";
    items.push({
      id: `app-${a.id}`,
      who: name,
      what: "applied for a job",
      when: new Date(a.created_at),
      href: `/recruitment`,
      initial: String(name).charAt(0).toUpperCase(),
    });
  });

  items.sort((a, b) => b.when.getTime() - a.when.getTime());
  const list = items.slice(0, 4);

  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography fontWeight={700}>Recent Employee Activity</Typography>
          <MUILink component={Link} href="/employees" underline="hover" sx={{ fontSize: 13 }}>
            VIEW ALL
          </MUILink>
        </Stack>

        <Stack divider={<Divider flexItem />} spacing={2}>
          {list.map((it) => (
            <Stack key={it.id} direction="row" spacing={2} alignItems="center" py={0.5}>
              <Avatar sx={{ width: 36, height: 36, fontSize: 16 }}>{it.initial}</Avatar>
              <Stack sx={{ flex: 1 }}>
                <Typography variant="body2">
                  <MUILink component={Link} href={it.href} underline="hover" sx={{ fontWeight: 600 }}>
                    {it.who}
                  </MUILink>{" "}
                  {it.what}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {timeAgo(it.when)}
                </Typography>
              </Stack>
            </Stack>
          ))}

          {list.length === 0 && (
            <Typography color="text.secondary" sx={{ py: 2 }}>
              No recent activity yet.
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
