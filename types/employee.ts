export type EmployeeStatus = "Active" | "On Leave" | "Inactive";

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  department: string;
  join_date: string;
  status?: EmployeeStatus;
  cv_url?: string | null;
  skills?: string | null;
  experience?: string | null;
  avatar_url?: string | null;

  
  address?: string | null;
  dob?: string | null;
  tenure_months?: number | null;
  performance?: number | null;


  qualifications?: string | null;     
  blood_group?: string | null;        
  emergency_contact?: string | null;  
  employee_code?: string | null;      
}
