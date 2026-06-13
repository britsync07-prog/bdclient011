
import fs from 'fs';
import path from 'path';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const filePath = path.join(process.cwd(), "..", "২০২৬ সালে ক্রিকেট বেটিংয়ের জন্য পিবিসি৮৮ ক্যাসিনো সেরা পছন্দ (6_11_2026 11：23….html");
  const html = fs.readFileSync(filePath, "utf8");
  
  const headMatch = html.match(/<head[^>]*>([\s\S]*)<\/head>/i);
  const headContent = headMatch ? headMatch[1] : "";
  
  const htmlTagMatch = html.match(/<html([^>]*)>/i);
  const htmlAttrsRaw = htmlTagMatch ? htmlTagMatch[1] : "";
  
  // We need to be careful with attributes in React. 
  // For simplicity, we'll just set the lang.
  
  return (
    <html lang="bn" data-critters-container="" dir="" className="is-desktop" style={{ fontSize: "3.75px", "--is-desktop": 1 } as any}>
      <head dangerouslySetInnerHTML={{ __html: headContent }} />
      <body className="default" style={{ fontSize: "16px" }}>
        {children}
      </body>
    </html>
  );
}
