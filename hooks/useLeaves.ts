"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import type { Leave, LeaveStatus } from "../types/leave";

export function useLeaves(status: LeaveStatus | "All" = "All") {
  return useQuery({
    queryKey: ["leaves", status],
    queryFn: async () => {
      let q = supabase
        .from("leaves")
        .select("*, employee:employees(id,name,department,avatar_url)")
        .order("created_at", { ascending: false });

      if (status !== "All") q = q.eq("status", status);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as Leave[];
    },
  });
}

export function useCreateLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      employee_id: string;
      leave_type: "Casual" | "Sick" | "Annual" | "Personal";
      start_date: string; 
      end_date: string;  
      reason?: string | null; 
    }) => {
      const { error } = await supabase.from("leaves").insert({
        ...payload,
        status: "Pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leaves"] });
    },
  });
}

export function useUpdateLeaveStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { id: string; status: LeaveStatus }) => {
      const { error } = await supabase
        .from("leaves")
        .update({ status: args.status })
        .eq("id", args.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leaves"] });
    },
  });
}
