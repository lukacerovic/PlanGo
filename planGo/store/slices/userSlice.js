import { createSlice } from '@reduxjs/toolkit';
import { updatedCurrentUser } from "../usersApi"

const initialState = {
  currentUser: {},
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setIsAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(updatedCurrentUser, (state, action) => {
      state.currentUser = action.payload.user;
    })
  }
});

export const { setCurrentUser, setIsAuthenticated, logout } = userSlice.actions;
export default userSlice.reducer;


