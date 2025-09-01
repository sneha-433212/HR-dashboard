"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { TextField, Button, Typography } from "@mui/material";
import styles from "../../../styles/Auth.module.css";

export default function AuthPage() {
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (isSignup) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) return setErrorMsg(error.message);
      router.push("/"); // redirect to login after signup
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return setErrorMsg(error.message);
      router.push("/");
    }
  };

  return (
    <section className={styles.user}>
      <div className={styles.userOptionsContainer}>

        <div className={styles.userOptionsText}>
          <div className={styles.userOptionsUnregistered}>
            <h2 className={styles.userUnregisteredTitle}>Don't have an account?</h2>
            <p className={styles.userUnregisteredText}>Create now!</p>
            <button
              className={styles.userUnregisteredSignup}
              onClick={() => setIsSignup(true)}
            >
              Sign Up
            </button>
          </div>

          <div className={styles.userOptionsRegistered}>
            <h2 className={styles.userRegisteredTitle}>Already have an account!</h2>
            <p className={styles.userRegisteredText}>Get started..</p>
            <button
              className={styles.userRegisteredLogin}
              onClick={() => setIsSignup(false)}
            >
              Login
            </button>
          </div>
        </div>


        <div
          className={`${styles.userOptionsForms} ${isSignup ? styles.bounceLeft : styles.bounceRight
            }`}
        >
          <div className={styles.forms}>
            <Typography className={styles.formsTitle}>
              {isSignup ? "Sign Up" : "Login"}
            </Typography>
            <form onSubmit={handleSubmit}>
              {isSignup && (
                <div className={styles.formsField}>
                  <TextField
                    placeholder="Full Name"
                    fullWidth
                    required
                    variant="standard"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              )}
              <div className={styles.formsField}>
                <TextField
                  placeholder="Email"
                  type="email"
                  fullWidth
                  required
                  variant="standard"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className={styles.formsField}>
                <TextField
                  placeholder="Password"
                  type="password"
                  fullWidth
                  required
                  variant="standard"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {errorMsg && (
                <Typography color="error" variant="body2">
                  {errorMsg}
                </Typography>
              )}
              <div className={styles.formsButtons}>
                {!isSignup && (
                  <Button variant="text" size="small">
                    Fill the form and then
                  </Button>
                )}
                <Button type="submit" variant="contained" color="primary">
                  {isSignup ? "Sign Up" : "Login"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
