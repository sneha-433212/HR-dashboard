
export type JobStatus = "Open" | "Closed" ; 


export interface Job {
  id: string;
  title: string;
  department: string;


  location?: string | null;
  employment_type?: string | null;

  description?: string | null;
  status: JobStatus;

  created_at: string;        
  updated_at?: string;        
}
