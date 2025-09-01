import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type LeaveTab = "All" | "Pending" | "Approved" | "Rejected";

interface LeaveUIState {
  activeTab: LeaveTab;          
  applyOpen: boolean;           
  selectedLeaveId: string | null;
}

const initialState: LeaveUIState = {
  activeTab: "All",
  applyOpen: false,
  selectedLeaveId: null,
};

const leaveSlice = createSlice({
  name: "leaveUI",
  initialState,
  reducers: {
    setLeaveTab(state, action: PayloadAction<LeaveTab>) {
      state.activeTab = action.payload;
    },
    openApplyLeave(state) {
      state.applyOpen = true;
    },
    closeApplyLeave(state) {
      state.applyOpen = false;
    },
    setSelectedLeave(state, action: PayloadAction<string | null>) {
      state.selectedLeaveId = action.payload;
    },
    resetLeaveUI() {
      return initialState;
    },
  },
});

export const {
  setLeaveTab,
  openApplyLeave,
  closeApplyLeave,
  setSelectedLeave,
  resetLeaveUI,
} = leaveSlice.actions;

export default leaveSlice.reducer;
