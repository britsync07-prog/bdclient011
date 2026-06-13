import { AppProviders } from "@/contexts/AppProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <AppProviders>{children}</AppProviders>
    </ErrorBoundary>
  );
}
