import type { Metadata } from "next";
import "./globals.css";
import "./claims.css";
import "./modals.css";
import "./employees.css";
import "./login.css";
import "./login-prototype.css";
import "./signout.css";

export const metadata: Metadata = {
  title: "KLB Time & Expense Portal",
  description: "Accessible weekly time tracking for teams and payroll administrators.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
