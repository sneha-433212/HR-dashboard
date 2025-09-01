import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import type { Job } from "../types/job";

const table = "jobs";


export function useJobs() {
  return useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Job[];
    },
  });
}

export function useJob(id?: string) {
  return useQuery({
    queryKey: ["jobs", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from(table).select("*").eq("id", id).single();
      if (error) throw error;
      return data as Job;
    },
  });
}


export function useSaveJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Job>) => {
      const now = new Date().toISOString();

      if (payload.id) {
      
        const { id, ...rest } = payload;
        const { data, error } = await supabase
          .from(table)
          .update({ ...rest, updated_at: now })
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return data as Job;
      } else {
        
        const { id: _i, created_at: _c, updated_at: _u, ...rest } = payload as any;
        const { data, error } = await supabase
          .from(table)
          .insert({ ...rest, updated_at: now })
          .select()
          .single();
        if (error) throw error;
        return data as Job;
      }
    },
    onSuccess: () => {
      
      qc.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}


export const useUpsertJob = useSaveJob;


export function useDeleteJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jobs"] }),
  });
}
