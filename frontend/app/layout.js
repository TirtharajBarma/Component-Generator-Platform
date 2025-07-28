"use client";
import "./globals.css";
import ProtectedRoute from "../components/ProtectedRoute";
import { usePathname } from "next/navigation";
import UserMenu from "../components/UserMenu";
import NotificationSystem from "../components/NotificationSystem";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "../store";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/auth";
  return (
    <html lang="en">
      <body>
        <Provider store={store}>
          <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
            <NotificationSystem />
            {isAuthPage ? null : (
              <div className="absolute top-4 right-4 z-50">
                <UserMenu />
              </div>
            )}
            {isAuthPage ? children : <ProtectedRoute>{children}</ProtectedRoute>}
          </PersistGate>
        </Provider>
      </body>
    </html>
  );
}
