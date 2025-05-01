export const metadata = {
  title: {
    default: "OnLaunch",
    template: "%s | OnLaunch",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ background: "white" }} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
