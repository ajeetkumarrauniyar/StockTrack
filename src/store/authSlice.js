import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userRole: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUserRole: (state, action) => {
      state.userRole = action.payload;
    },
  },
});

export const { setUserRole } = authSlice.actions;
export const selectUserRole = (state) => state.auth.userRole;
export default authSlice.reducer;
