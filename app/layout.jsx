import "./globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

export const metadata = {
  title: "LOTA AI",
  description: "Your Personal AI Assistant",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <GoogleOAuthProvider clientId="828416886131-q4n0lndnrnu6qa2pnl34gh0uo9qvdi99.apps.googleusercontent.com">
          {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
