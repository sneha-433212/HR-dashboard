
export type LeaveStatus = "Pending" | "Approved" | "Rejected";

export interface Leave {
  id: string;
  employee_id: string;
  leave_type: "Casual" | "Sick" | "Annual" | "Personal";
  start_date: string;
  end_date: string;
  status: LeaveStatus;
  reason?: string | null; 
  employee?: {
    id: string;
    name: string;
    department: string;
    avatar_url?: string | null;
  };
}
