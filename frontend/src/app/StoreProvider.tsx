"use client";
import { store } from "../lib/store";
import { Provider as ReactReduxProvider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";

export default function StoreProvider(
   {children}: {children: React.ReactNode}
) {
   let reduxPersistor = persistStore(store);
   return (
      <ReactReduxProvider store={store}>
         <PersistGate loading={null} persistor={reduxPersistor}>
            {children}
         </PersistGate>
      </ReactReduxProvider>
   )
}