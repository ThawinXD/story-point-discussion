import { combineReducers, configureStore } from "@reduxjs/toolkit";
import userSlice from "./features/user";
import { useSelector , TypedUseSelectorHook} from "react-redux";
import { persistReducer, FLUSH, REGISTER, REHYDRATE, PAUSE, PERSIST, PURGE } from "redux-persist";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";
import { WebStorage } from "redux-persist/lib/types";

function createPersistStorage(): WebStorage {
   const isServer = typeof window === "undefined";

   if(isServer) {
      return {
         getItem() {
            return Promise.resolve(null);
         },
         setItem() {
            return Promise.resolve();
         },
         removeItem() {
            return Promise.resolve();
         }
      };
   }
   return createWebStorage('local');
}

const storage = createPersistStorage();

const persistConfig = {
   key: "rootPersist",
   storage
}
const rootPersist = combineReducers({userSlice: userSlice});
const reduxPersistReducer = persistReducer(persistConfig, rootPersist);

export const store = configureStore({
   reducer: reduxPersistReducer,
   middleware: (getDefaultMiddleware) => getDefaultMiddleware({
      serializableCheck: {
         ignoredActions: [FLUSH, REGISTER, REHYDRATE, PAUSE, PERSIST, PURGE]
      }
   })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;