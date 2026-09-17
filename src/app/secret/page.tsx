import type { Metadata } from "next";
import { RobotFlyby } from "@/components/ui/robot-flyby";

// Deliberately unlinked: nothing in the nav or the footer points here, and it
// is kept out of the index. The game that will replace the placeholder scene
// goes in this route.
export const metadata: Metadata = {
  title: "ASTRA",
  robots: { index: false, follow: false },
};

export default function SecretPage() {
  return <RobotFlyby />;
}
