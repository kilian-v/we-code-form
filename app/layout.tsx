import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ReactReduxProvider } from "@/components/redux-provider";
import { ReactQueryProvider } from "@/components/query-provider";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // Include the weights you need
  variable: "--font-montserrat", // Optional: for CSS variable usage
});

export const metadata: Metadata = {
  title: "MTN Innovation Lab Formulaire",
  description: "MTN Innovation Lab Formulaire",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ReactReduxProvider>
      <html lang="en">
        <body className={`${montserrat.className}  antialiased`}>
          <ReactQueryProvider>{children}</ReactQueryProvider>
          <Toaster />
        </body>
      </html>
    </ReactReduxProvider>
  );
}
