import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "react-day-picker/dist/style.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SprintDev - Modern Project Management",
  description: "Streamline your workflow with SprintDev's intuitive project management platform",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#a855f7",
          colorBackground: "#0f172a",
          colorInputBackground: "#1e293b",
          colorInputText: "#f1f5f9",
          colorText: "#f1f5f9",
          colorTextSecondary: "#94a3b8",
          borderRadius: "0.75rem",
        },
        elements: {
          formButtonPrimary: {
            background: "linear-gradient(135deg, #a855f7 0%, #0ea5e9 100%)",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 0 20px rgba(168, 85, 247, 0.4)",
            },
          },
          card: {
            background: "rgba(15, 23, 42, 0.8)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(168, 85, 247, 0.2)",
            borderRadius: "0.75rem",
          },
          headerTitle: {
            color: "#a855f7",
          },
          headerSubtitle: {
            color: "#94a3b8",
          },
          socialButtonsBlockButton: {
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            "&:hover": {
              background: "rgba(255, 255, 255, 0.1)",
            },
          },
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} modern-gradient-background particles-background`} suppressHydrationWarning>
          <ThemeProvider>
            <Header />
            <main className="min-h-screen">{children}</main>
            <Toaster richColors />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
