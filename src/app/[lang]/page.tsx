import { HomeLanding } from "@/components/home/home-landing";
import { getHandoutPreviews } from "@/lib/handouts";
import { getConference, getLiveNotices, getPartnerBar } from "@/lib/site-content";
import { getUpcomingEvents } from "@/lib/events";

export const revalidate = 300;

export default async function Home() {
  // Fetched on the server so the marquee ships with real covers in the HTML
  // and the browser can start them as soon as it parses the markup. The grid
  // needs 6 columns x 5 rows, so anything under 30 makes the last columns
  // repeat the first ones; 48 leaves room to spare.
  const [previews, notices, conference, events, partners] = await Promise.all([
    getHandoutPreviews(48),
    getLiveNotices(),
    getConference(),
    getUpcomingEvents(),
    getPartnerBar(),
  ]);
  return (
    <HomeLanding
      previews={previews.map((h) => h.thumbUrl)}
      notices={notices}
      conference={conference}
      events={events}
      partners={partners}
    />
  );
}
