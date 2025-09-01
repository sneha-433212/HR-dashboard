import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import type { Employee } from "../types/employee";

const table = "employees";
const CV_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_CV_BUCKET || "cvs";

async function uploadCvToBucket(file: File): Promise<string> {
  const fileName = `${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage.from(CV_BUCKET).upload(fileName, file);
  if (error) throw new Error(error.message);
  const { data: pub } = supabase.storage.from(CV_BUCKET).getPublicUrl(data.path);
  return pub.publicUrl;
}

export async function fetchEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase.from(table).select("*").order("join_date", { ascending: false });
  if (error) throw new Error(error.message);
  return data as Employee[];
}

export function useEmployees() {
  return useQuery({ queryKey: ["employees"], queryFn: fetchEmployees });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: ["employees", id],
    queryFn: async () => {
      const { data, error } = await supabase.from(table).select("*").eq("id", id).single();
      if (error) throw new Error(error.message);
      return data as Employee;
    },
    enabled: !!id,
  });
}

type UpsertPayload = Partial<Employee> & { cv_file?: File | null };

export function useUpsertEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpsertPayload) => {
      const { cv_file, ...rest } = payload;
      let cv_url = rest.cv_url ?? null;
      if (cv_file) cv_url = await uploadCvToBucket(cv_file);

      const row = { ...rest, cv_url };
      const { data, error } = await supabase.from(table).upsert(row, { onConflict: "id" }).select().single();
      if (error) throw new Error(error.message);
      return data as Employee;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}

export function useDeleteEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw new Error(error.message);
      return id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}
