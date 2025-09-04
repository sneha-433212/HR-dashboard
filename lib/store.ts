import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "../slices/uiSlice";
import employeeReducer from "../slices/employeeSlice";
import leaveReducer from "../slices/leaveSlice";
import jobReducer from "../slices/jobSlice";

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    employees: employeeReducer,
    leaves: leaveReducer,
    jobs: jobReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
