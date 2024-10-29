import { Ubuntu } from "next/font/google";

const ubuntu = Ubuntu({ weight: ["400", "700"], subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      {/* Loader */}

      <div style={ubuntu.style}>{children}</div>
    </div>
  );
}
