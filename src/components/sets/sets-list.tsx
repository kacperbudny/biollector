import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { SetCard } from "@/components/sets/set-card";
import {
  SectionHeading,
  SubsectionHeading,
} from "@/components/typography/headings";
import { MutedText } from "@/components/typography/text";
import type { Wave } from "@/domain/sets";
import type { SetViewModel } from "@/domain/view-models/set.view-model";
import type {
  SetsListViewModel,
  WaveSection as WaveSectionViewModel,
  YearSection as YearSectionViewModel,
} from "@/domain/view-models/sets-list.view-model";

type SetsListProps = {
  viewModel: SetsListViewModel;
};

export function SetsList({ viewModel }: SetsListProps) {
  return viewModel.data.map((yearSection) => (
    <YearSection key={yearSection.year} viewModel={yearSection} />
  ));
}

type YearSectionProps = {
  viewModel: YearSectionViewModel;
};

function YearSection({
  viewModel: { year, waves, totalCount, collectionCount, isComplete },
}: YearSectionProps) {
  return (
    <div className="mb-12">
      <SectionHeading>
        <span className={`inline-flex items-center gap-2`}>
          {year}
          {isComplete && (
            <CheckCircleIcon
              className="h-5 w-5 shrink-0 text-green-600"
              aria-hidden
            />
          )}
        </span>

        {collectionCount && (
          <MutedText>
            ({collectionCount} of {totalCount} sets)
          </MutedText>
        )}
      </SectionHeading>
      {waves.map((waveSection) => (
        <WaveSection key={waveSection.wave} viewModel={waveSection} />
      ))}
    </div>
  );
}

type WaveSectionProps = {
  viewModel: WaveSectionViewModel;
};

function WaveSection({
  viewModel: { wave, sets, totalCount, collectionCount, isComplete },
}: WaveSectionProps) {
  return (
    <div className="mb-8">
      <SubsectionHeading>
        <span className={`inline-flex items-center gap-2`}>
          {wave}
          {isComplete && (
            <CheckCircleIcon
              className="h-5 w-5 shrink-0 text-green-600"
              aria-hidden
            />
          )}
        </span>

        {collectionCount && (
          <MutedText>
            ({collectionCount} of {totalCount} sets)
          </MutedText>
        )}
      </SubsectionHeading>
      <SetGrid sets={sets} wave={wave} />
    </div>
  );
}

type SetGridProps = {
  sets: SetViewModel[];
  wave: Wave;
};

function SetGrid({ sets, wave }: SetGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
      {sets.map((set) => (
        <SetCard key={set.catalogNumber} set={set} wave={wave} />
      ))}
    </div>
  );
}
