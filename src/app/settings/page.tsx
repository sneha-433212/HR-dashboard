"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import {
  Avatar,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Snackbar,
  Alert,
  Stack,
} from "@mui/material";

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setProfile({ ...data, email: user.email, password: "********" });
      } else {
        await supabase.from("profiles").insert({
          id: user.id,
          email: user.email,
          full_name: user.email,
        });
        setProfile({
          id: user.id,
          email: user.email,
          username: "",
          full_name: user.email,
          title: "",
          language: "",
          phone: "",
          address: "",
          avatar_url: "",
          password: "********",
        });
      }
    };
    fetchProfile();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && profile) {
      const file = e.target.files[0];
      const filePath = `avatars/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from(process.env.NEXT_PUBLIC_SUPABASE_CV_BUCKET as string)
        .upload(filePath, file, { upsert: true });

      if (!error) {
        const { data } = supabase.storage
          .from(process.env.NEXT_PUBLIC_SUPABASE_CV_BUCKET as string)
          .getPublicUrl(filePath);
        if (data?.publicUrl) {
          setProfile({ ...profile, avatar_url: data.publicUrl });
        }
      } else {
        console.error("Upload failed:", error.message);
      }
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        username: profile.username,
        full_name: profile.full_name,
        title: profile.title,
        language: profile.language,
        phone: profile.phone,
        address: profile.address,
        avatar_url: profile.avatar_url,
      })
      .eq("id", user.id);

    if (!error) {
      setToast({ type: "success", msg: "Profile updated successfully!" });
    }
  };

  if (!profile) {
    return <Typography sx={{ p: 4 }}>Loading profile...</Typography>;
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "30px" }}>
      <Card
        sx={{
          width: "100%",
          maxWidth: "1200px",
          p: 4,
          position: "relative",
        }}
      >
    
      <Button
  variant="contained"
  onClick={handleSave}
  sx={{
    position: "absolute",
    top: 20,
    right: 20,
    fontSize: "0.8rem",
    backgroundColor: "#8597d0ff", 
    color: "#fff",              
    "&:hover": {
      backgroundColor: "#6e96beff", 
    },
  }}
>
  Save
</Button>


        <CardContent>
          
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar
              src={profile.avatar_url || ""}
              sx={{ width: 120, height: 120, fontSize: 40, bgcolor: "#673ab7" }}
            >
              {!profile.avatar_url && profile.full_name?.[0]?.toUpperCase()}
            </Avatar>
            <Button
  variant="outlined"
  component="label"
  sx={{
    mt: 2,
    fontSize: "0.8rem",
    color: "#2d272dff",              
    borderColor: "#a691aaff",        
    backgroundColor: "#e8c4e2ff",
    "&:hover": {
      borderColor: "#aec1d3ff",     
      backgroundColor: "#ceabceff"
    },
  }}
>
  Upload Avatar
  <input type="file" hidden onChange={handleAvatarUpload} />
</Button>

            <Typography variant="h5" sx={{ mt: 2 }}>
              {profile.full_name}
            </Typography>
            <Typography color="text.secondary">
              {profile.email} – {profile.title || "Administrator"}
            </Typography>
          </div>

         {/* ✅ Center all fields nicely in rows */}
<Stack
  spacing={3}
  sx={{
    mt: 3,
    alignItems: "center", // center whole block
  }}
>
  {/* Row 1 */}
  <Stack direction="row" spacing={2} sx={{ width: "100%", maxWidth: 900 }}>
    <TextField
      label="Username"
      value={profile.username || ""}
      onChange={(e) => setProfile({ ...profile, username: e.target.value })}
      fullWidth
    />
    <TextField
      label="Full Name"
      value={profile.full_name || ""}
      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
      fullWidth
    />
    <TextField
      label="Email"
      value={profile.email || ""}
      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
      fullWidth
    />
  </Stack>

  {/* Row 2 */}
  <Stack direction="row" spacing={2} sx={{ width: "100%", maxWidth: 900 }}>
    <TextField
      label="Password"
      type="password"
      value={profile.password || "********"}
      onChange={(e) => setProfile({ ...profile, password: e.target.value })}
      fullWidth
    />
    <TextField
      label="Phone"
      value={profile.phone || ""}
      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
      fullWidth
    />
    <TextField
      label="Address"
      value={profile.address || ""}
      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
      fullWidth
    />
  </Stack>

  {/* Row 3 */}
  <Stack direction="row" spacing={2} sx={{ width: "100%", maxWidth: 900 }}>
    <TextField
      label="Title"
      value={profile.title || ""}
      onChange={(e) => setProfile({ ...profile, title: e.target.value })}
      fullWidth
    />
    <TextField
      label="Language"
      value={profile.language || ""}
      onChange={(e) => setProfile({ ...profile, language: e.target.value })}
      fullWidth
    />
  </Stack>
</Stack>

         
        </CardContent>
      </Card>

      {/* Snackbar Alert */}
      {toast && (
        <Snackbar
          open={true}
          autoHideDuration={2500}
          onClose={() => setToast(null)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setToast(null)}
            severity={toast.type as "success" | "error"}
            sx={{
              borderRadius: 2,
              backgroundColor:
                toast.type === "success"
                  ? "rgba(180, 219, 182, 0.8)"
                  : "rgba(211, 47, 47, 0.8)",
              color: "#fff",
              fontWeight: 600,
              backdropFilter: "blur(6px)",
            }}
          >
            {toast.msg}
          </Alert>
        </Snackbar>
      )}
    </div>
  );
}
