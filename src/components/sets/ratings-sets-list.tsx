import { SetCard } from "@/components/sets/set-card";
import { SectionHeading } from "@/components/typography/headings";
import type { RatingsViewModel } from "@/domain/view-models/ratings.view-model";

type RatingsSetsListProps = {
  viewModel: RatingsViewModel;
};

export function RatingsSetsList({ viewModel }: RatingsSetsListProps) {
  return viewModel.sections.map((section) => (
    <div key={section.rating} className="mb-12">
      <SectionHeading>{section.label}</SectionHeading>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {section.sets.map((set) => (
          <SetCard key={set.catalogNumber} set={set} wave={set.wave} />
        ))}
      </div>
    </div>
  ));
}
