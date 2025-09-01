
export type ApplicationStatus = "New" | "Shortlisted" | "Rejected" | "Hired";


export interface Application {
  id: string;
  job_id: string;


  candidate_name: string;
  email: string;


  phone?: string | null;
  cover_letter?: string | null;
  skills?: string | null;


  resume_url?: string | null;
  resume_path?: string | null;

  status: ApplicationStatus;
  created_at: string;
  updated_at?: string;


  job?: {
    id: string;
    title: string;
    department: string;
  };
}
