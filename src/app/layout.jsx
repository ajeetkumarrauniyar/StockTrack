"use client";

import { Provider } from "react-redux";
import { store } from "../store";
import { ClerkProvider } from "@clerk/nextjs";
import "../globals.css";
import './tasks/dailyStockCheck.js';

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <Provider store={store}>{children}</Provider>
        </body>
      </html>
    </ClerkProvider>
  );
}
