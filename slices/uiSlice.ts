import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  empSearch: string;
  empDept: string | "All";
  empStatus: string | "All";
  empPage: number;
  empPageSize: number;
}

const initial: UIState = {
  empSearch: "",
  empDept: "All",
  empStatus: "All",
  empPage: 1,
  empPageSize: 5,
};

const uiSlice = createSlice({
  name: "ui",
  initialState: initial,
  reducers: {
    setEmpSearch: (s, a: PayloadAction<string>) => { s.empSearch = a.payload; s.empPage = 1; },
    setEmpDept: (s, a: PayloadAction<string>) => { s.empDept = a.payload; s.empPage = 1; },
    setEmpStatus: (s, a: PayloadAction<string>) => { s.empStatus = a.payload; s.empPage = 1; },
    setEmpPage: (s, a: PayloadAction<number>) => { s.empPage = a.payload; },
  },
});

export const { setEmpSearch, setEmpDept, setEmpStatus, setEmpPage } = uiSlice.actions;
export default uiSlice.reducer;
