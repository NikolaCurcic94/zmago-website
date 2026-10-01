import { StoryHero } from "@/components/story/StoryHero";
import { IdeaSection } from "@/components/story/IdeaSection";
import { BuildSection } from "@/components/story/BuildSection";
import { DetailsSection } from "@/components/story/DetailsSection";
import { JourneySection } from "@/components/story/JourneySection";
import { SupportCta } from "@/components/story/SupportCta";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

export default function StoryPage() {
  return (
    <main>
      <StoryHero />
      <IdeaSection />
      <BuildSection />
      <DetailsSection />
      <JourneySection />
      <SupportCta />
      <RevealOnScroll />
    </main>
  );
}
