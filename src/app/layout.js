import "./globals.css";


export const metadata = {
  title: "Mmarau meta-verse",
  description: "Student-Student interaction",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
