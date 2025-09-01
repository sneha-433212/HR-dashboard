import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface JobUIState {
  postOpen: boolean;          
  selectedJobId: string | null;
  search: string;             
}

const initialState: JobUIState = {
  postOpen: false,
  selectedJobId: null,
  search: "",
};

const jobSlice = createSlice({
  name: "jobUI",
  initialState,
  reducers: {
    openPostJob(state) {
      state.postOpen = true;
    },
    closePostJob(state) {
      state.postOpen = false;
    },
    setSelectedJob(state, action: PayloadAction<string | null>) {
      state.selectedJobId = action.payload;
    },
    setJobSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    resetJobUI() {
      return initialState;
    },
  },
});

export const {
  openPostJob,
  closePostJob,
  setSelectedJob,
  setJobSearch,
  resetJobUI,
} = jobSlice.actions;

export default jobSlice.reducer;
