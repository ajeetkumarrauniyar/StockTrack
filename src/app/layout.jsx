"use client";
import React, { useEffect } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "@/store";
import { ClerkProvider, useUser } from "@clerk/nextjs";
import "../globals.css";
import { clerkConfig } from "../../clerk";
import { Loader } from "@/components/loader";
import { selectUserRole, setUserRole } from "@/store/authSlice";

function AuthWrapper({ children }) {
  const { user, isLoaded } = useUser();
  const dispatch = useDispatch();
  const userRole = useSelector(selectUserRole);

  useEffect(() => {
    if (isLoaded && user) {
      const role = user.publicMetadata?.role || "viewer";
      dispatch(setUserRole(role));
    }
  }, [isLoaded, user, dispatch]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
        <Loader className="w-16 h-16 text-white" />
      </div>
    );
  }

  return React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { userRole });
    }
    return child;
  });
}

function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      <AuthWrapper>{children}</AuthWrapper>
    </Provider>
  );
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider {...clerkConfig}>
      <Provider store={store}>
        <html lang="en">
          <body>
            <ReduxProvider>{children}</ReduxProvider>
          </body>
        </html>
      </Provider>
    </ClerkProvider>
  );
}
