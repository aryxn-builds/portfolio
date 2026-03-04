import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import { CustomCursor } from "@/components/CustomCursor";
import { EasterEggs } from "@/components/EasterEggs";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aryan Yadav | ML & GenAI Engineer",
  description: "Futuristic 3D storytelling portfolio of Aryan Yadav.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (sessionStorage.getItem('loaded') === 'true') {
                  document.documentElement.classList.add('skip-loading');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} antialiased bg-[#050508] text-white font-sans`}
      >
        <CustomCursor />
        <EasterEggs />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
