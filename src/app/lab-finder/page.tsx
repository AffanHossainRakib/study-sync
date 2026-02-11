import { LabFinder } from "@/components/LabFinder";

export const metadata = {
  title: "Lab Finder | The Study Sync",
  description:
    "Find available CSE lab rooms at BRAC University instantly. Check real-time lab availability by day and time slot.",
};

export default function LabFinderPage() {
  return (
    <div className="min-h-screen">
      <section className="pt-24 pb-8 px-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
          Lab Finder
        </h1>
        <p className="mt-2 text-muted-foreground max-w-md mx-auto">
          Find an empty CSE lab room at BRAC University instantly
        </p>
        <p className="mt-1 text-sm text-muted-foreground/70">
          Last update:  Fall 2025
        </p>
      </section>
      <div className="px-4 pb-16">
        <LabFinder />
      </div>
    </div>
  );
}
