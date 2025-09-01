
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import type { Application } from "../types/application";

const table = "applications";


export async function fetchApplications(): Promise<
  (Application & { job?: { id: string; title: string; department: string } })[]
> {
  const { data, error } = await supabase
    .from(table)
    .select("*, job:jobs(id, title, department)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as any;
}


export function useApplications() {
  return useQuery({ queryKey: ["applications"], queryFn: fetchApplications });
}


export function useApplicationsByJob(jobId?: string) {
  return useQuery({
    queryKey: ["applications", "job", jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table)
        .select("*, job:jobs(id, title, department)")
        .eq("job_id", jobId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any;
    },
    enabled: !!jobId,
  });
}


export function useUpdateApplicationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Application["status"] }) => {
      const { error } = await supabase.from(table).update({ status }).eq("id", id);
      if (error) throw error;
      return { id, status };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applications"] });
    },
  });
}


export const useSetApplicationStatus = useUpdateApplicationStatus;


export function useApply() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: Omit<Application, "id" | "status" | "created_at"> & {
        resume_file?: File | null;
        resume_url?: string | null;
      }
    ) => {
      const { resume_file, resume_url: incomingUrl, ...rest } = payload;


      let resume_url: string | null = incomingUrl ?? null;


      if (!resume_url && resume_file) {

        const bucket = process.env.NEXT_PUBLIC_SUPABASE_RECRUITMENT_BUCKET!;

        const fileName = `${Date.now()}_${resume_file.name}`;
        const { data: up, error: upErr } = await supabase.storage
          .from(bucket)
          .upload(fileName, resume_file);
        if (upErr) throw upErr;


        const { data: pub } = supabase.storage.from(bucket).getPublicUrl(up.path);
        resume_url = pub.publicUrl;
      }


      const row = { ...rest, resume_url, status: "New" as Application["status"] };

      const { error } = await supabase.from(table).insert(row);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applications"] });
    },
  });
}
