import { HomeLanding } from "@/components/home/home-landing";
import { getHandoutPreviews } from "@/lib/handouts";

export const revalidate = 300;

export default async function Home() {
  // Fetched on the server so the marquee ships with real covers in the HTML
  // and the browser can start them as soon as it parses the markup.
  const previews = await getHandoutPreviews(24);
  return <HomeLanding previews={previews.map((h) => h.thumbUrl)} />;
}
