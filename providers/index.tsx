import { ClientSideProviders } from "./client-side-providers";
import { ServerSideProviders } from "./server-side-providers";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ServerSideProviders>
      <ClientSideProviders>{children}</ClientSideProviders>
    </ServerSideProviders>
  );
}
