import fs from 'fs';
import path from 'path';
import { HydrationBridge } from "@/components/home/HydrationBridge";

export default function Page() {
  const filePath = path.join(process.cwd(), "..", "২০২৬ সালে ক্রিকেট বেটিংয়ের জন্য পিবিসি৮৮ ক্যাসিনো সেরা পছন্দ (6_11_2026 11：23….html");
  const html = fs.readFileSync(filePath, "utf8");
  
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const bodyContent = bodyMatch ? bodyMatch[1] : html;

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: bodyContent }} />
      <HydrationBridge />
    </>
  );
}
