import { AppShell } from "@/components/layout/app-shell";
import { DashboardPanelProvider } from "@/components/layout/dashboard-panel-context";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { auth } from "@/auth";
import { isPublicDemoDeployment, profileForSession } from "@/lib/demo-profile";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Compass",
  description: "Personal focus and life-balance app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const profile = profileForSession(session?.user?.email);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className={`${inter.className} min-h-screen antialiased`}>
        <ThemeProvider>
          <AuthSessionProvider session={session}>
            <DashboardPanelProvider>
              <AppShell
                displayName={profile.name}
                profileSubtitle={profile.subtitle}
                canSignOut={!isPublicDemoDeployment()}
              >
                {children}
              </AppShell>
            </DashboardPanelProvider>
          </AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
