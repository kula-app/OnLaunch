import { Providers } from "../providers";

export const metadata = {
  title: {
    default: "OnLaunch",
    template: "OnLaunch | %s",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
