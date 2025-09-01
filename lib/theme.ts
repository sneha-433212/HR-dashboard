import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: { main: "#3f51b5" },                      
    secondary: { main: "#607d8b" },                    
    success: { main: "#22c55e" },                      
    error: { main: "#ef4444" },                        
    warning: { main: "#eab308" },                     
    background: { default: "#f5f7fb" },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiCard: { styleOverrides: { root: { boxShadow: "0 4px 16px rgba(0,0,0,.06)" } } },
  },
});
