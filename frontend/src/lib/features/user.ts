import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IUser } from "@/interfaces";

type UserState = {
  user: IUser | null;
  url: string | null;
};

const initialState: UserState = {
  user: null,
  url: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserName(state, action: PayloadAction<string>) {
      if (state.user) {
        state.user.name = action.payload;
      }
      else {
        state.user = { id: undefined, name: action.payload };
      }
    },
    setUserId(state, action: PayloadAction<string>) {
      if (state.user) {
        state.user.id = action.payload;
      }
      else {
        state.user = { id: action.payload, name: "" };
      }
    },
    setUser(state, action: PayloadAction<IUser>) {
      state.user = action.payload;
    },
    clearUser(state) {
      state.user = null;
    },
    setURL(state, action: PayloadAction<string | null>) {
      state.url = action.payload;
    },
  },
});

export const { setUserId, setUserName, setUser, clearUser, setURL } = userSlice.actions;
export default userSlice.reducer;