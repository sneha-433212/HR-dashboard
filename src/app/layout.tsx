"use client";
import { ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "../../lib/store";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../../lib/queryClient";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "../../lib/theme";
import { MuiAppRouterCacheProvider } from "../../lib/muiCache";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import styles from "../../styles/Layout.module.css";

import { usePathname } from "next/navigation"; 
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  return (
    <html lang="en">
      <body>
        <MuiAppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Provider store={store}>
              <QueryClientProvider client={queryClient}>
                {isAuthPage ? (
                
                  <>{children}</>
                ) : (
                
                  <div className={styles.shell}>
                    <Sidebar />
                    <main className={styles.main}>
                      <Navbar />
                      <div className={styles.content}>{children}</div>
                    </main>
                  </div>
                )}
              </QueryClientProvider>
            </Provider>
          </ThemeProvider>
        </MuiAppRouterCacheProvider>
      </body>
    </html>
  );
}
