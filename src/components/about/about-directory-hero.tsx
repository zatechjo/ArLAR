import { PageHero } from "@/components/page-hero";

type AboutDirectoryHeroProps = {
  currentPage: string;
  title: string;
  description: string;
  grainId: string;
};

export function AboutDirectoryHero({
  currentPage,
  title,
  description,
  grainId,
}: AboutDirectoryHeroProps) {
  return (
    <PageHero
      breadcrumbs={[
        { label: "About Us", href: "/about" },
        { label: currentPage },
      ]}
      title={title}
      description={description}
      grainId={grainId}
    />
  );
}
