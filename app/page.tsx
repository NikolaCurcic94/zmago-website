import { StoryHero } from "@/components/story/StoryHero";
import { IdeaSection } from "@/components/story/IdeaSection";
import { BuildSection } from "@/components/story/BuildSection";
import { DetailsSection } from "@/components/story/DetailsSection";
import { PlaygroundPreview } from "@/components/story/PlaygroundPreview";
import { JourneySection } from "@/components/story/JourneySection";
import { SupportCta } from "@/components/story/SupportCta";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { MAIN_ID } from "@/content/site";

export default function StoryPage() {
  return (
    <main id={MAIN_ID}>
      <StoryHero />
      <IdeaSection />
      <BuildSection />
      <DetailsSection />
      <PlaygroundPreview />
      <JourneySection />
      <SupportCta />
      <RevealOnScroll />
    </main>
  );
}
