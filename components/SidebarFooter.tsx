"use client";

import { Avatar } from "@mui/material";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import styles from "../styles/Sidebar.module.css";
import Link from "next/link";

function stringToColor(string: string) {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ("00" + value.toString(16)).slice(-2);
  }
  return color;
}

export default function SidebarFooter() {
  const [user, setUser] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser(data.user);


        const { data: profile } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", data.user.id)
          .single();

        if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);
      }
    };
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);

        if (session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("avatar_url")
            .eq("id", session.user.id)
            .single();

          if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const avatarLetter = user?.email?.[0]?.toUpperCase() || "A";
  const avatarColor = stringToColor(user?.email || "Admin");

return (
  <div className={styles.userFooter}>
    <Link href="/recruitment/apply">
      <Avatar
        src={avatarUrl || undefined}
        sx={{
          width: 36,
          height: 36,
          mr: 1,
          bgcolor: avatarUrl ? "transparent" : avatarColor,
          color: avatarUrl ? "inherit" : "#fff",
          cursor: "pointer", 
        }}
      >
        {!avatarUrl && avatarLetter}
      </Avatar>
    </Link>
    <div>
  <div style={{ fontWeight: 600 }}>
    {user ? "Admin User" : "Guest User"}
  </div>
  <div style={{ fontSize: 12, color: "#64748b" }}>
    {user?.email || "guest@company.com"}
  </div>
</div>

  </div>
);
}