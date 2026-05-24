import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Script from "next/dist/client/script";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata: Metadata = {
//   title: "Tahfidz Smart",
//   description: "Kelola hafalan Al-Qur'an dengan mudah dan efisien menggunakan Tahfidz Smart.",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html
//       lang="en"
//       className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
//     >
//       <body className="min-h-full flex flex-col">{children}
//         <Toaster 
//           theme="dark" 
//           richColors 
//           position="top-right" 
//           toastOptions={{
//             style: {
//               background: '#111a15',
//               border: '1px solid rgba(45,212,160,0.2)',
//               color: '#e8f0eb'
//             }
//           }}
//         />
//       </body>
//     </html>
//   );
// }

export const metadata: Metadata = {
  title: "Tahfidz Smart - SaaS",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <Script 
          type="text/javascript" 
          src="https://app.sandbox.midtrans.com/snap/snap.js" 
          data-client-key="Mid-client-_ckS4HQwr0jImcnR"
          strategy="lazyOnload"
        />
      </head>
      <body className="min-h-screen">{children}
         <Toaster 
          theme="dark" 
          richColors 
          position="top-right" 
          toastOptions={{
            style: {
              background: '#111a15',
              border: '1px solid rgba(45,212,160,0.2)',
              color: '#e8f0eb'
            }
          }}
        />
      
      </body>
    </html>
  );
}
