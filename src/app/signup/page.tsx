// app/signup/page.tsx
"use client";
import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { TextField, Button, Card, CardContent, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      router.push("/login"); // after signup, go to login
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-[400px] shadow-lg">
        <CardContent>
          <Typography variant="h5" className="mb-4 text-center">
            HR Dashboard Sign Up
          </Typography>
          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
            />
            {errorMsg && (
              <Typography color="error" variant="body2">
                {errorMsg}
              </Typography>
            )}
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Sign Up
            </Button>
            <Button onClick={() => router.push("/login")} fullWidth>
              Already have an account? Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
