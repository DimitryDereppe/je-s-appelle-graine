import { Lora } from "next/font/google";
import "./globals.css";
import Header from "../components/header/Header";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className={lora.variable}>
        <Header />
        {children}
      </body>
    </html>
  );
}
