import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface EmployeeUIState {
  selectedId: string | null;     
  isAddOpen: boolean;            
  editId: string | null;       
  selectedIds: string[];         
}

const initialState: EmployeeUIState = {
  selectedId: null,
  isAddOpen: false,
  editId: null,
  selectedIds: [],
};

const employeeSlice = createSlice({
  name: "employeeUI",
  initialState,
  reducers: {
    setSelectedEmployee(state, action: PayloadAction<string | null>) {
      state.selectedId = action.payload;
    },
    openAddEmployee(state) {
      state.isAddOpen = true;
    },
    closeAddEmployee(state) {
      state.isAddOpen = false;
    },
    openEditEmployee(state, action: PayloadAction<string>) {
      state.editId = action.payload;
    },
    closeEditEmployee(state) {
      state.editId = null;
    },
    toggleSelectEmployee(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (state.selectedIds.includes(id)) {
        state.selectedIds = state.selectedIds.filter(x => x !== id);
      } else {
        state.selectedIds.push(id);
      }
    },
    clearSelectedEmployees(state) {
      state.selectedIds = [];
    },
    resetEmployeeUI() {
      return initialState;
    },
  },
});

export const {
  setSelectedEmployee,
  openAddEmployee,
  closeAddEmployee,
  openEditEmployee,
  closeEditEmployee,
  toggleSelectEmployee,
  clearSelectedEmployees,
  resetEmployeeUI,
} = employeeSlice.actions;

export default employeeSlice.reducer;
