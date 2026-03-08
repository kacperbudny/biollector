import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { SetCard } from "@/components/sets/set-card";
import {
  SectionHeading,
  SubsectionHeading,
} from "@/components/typography/headings";
import type { Wave } from "@/domain/sets";
import type { SetViewModel } from "@/domain/view-models/set.view-model";
import type {
  SetsListViewModel,
  WaveSection as WaveSectionType,
} from "@/domain/view-models/sets-list.view-model";

type SetsListProps = {
  viewModel: SetsListViewModel;
};

export function SetsList({ viewModel }: SetsListProps) {
  return viewModel.data.map((yearSection) => (
    <YearSection
      key={yearSection.year}
      year={yearSection.year}
      waves={yearSection.waves}
      totalInYear={yearSection.totalCount}
      collectionCount={yearSection.collectionCount}
    />
  ));
}

type YearSectionProps = {
  year: string;
  waves: WaveSectionType[];
  totalInYear: number;
  collectionCount?: number;
};

function YearSection({
  year,
  waves,
  totalInYear,
  collectionCount,
}: YearSectionProps) {
  const isComplete =
    collectionCount !== undefined && collectionCount === totalInYear;

  return (
    <div className="mb-12">
      <SectionHeading>
        <span className={`inline-flex items-center gap-2`}>
          {year}
          {isComplete && (
            <CheckCircleIcon
              className="h-5 w-5 shrink-0 text-success-600"
              aria-hidden
            />
          )}
        </span>
        {collectionCount !== undefined && (
          <span className="ml-2 font-normal text-default-500">
            ({collectionCount} of {totalInYear} sets)
          </span>
        )}
      </SectionHeading>
      {waves.map((waveSection) => (
        <WaveSection
          key={waveSection.wave}
          wave={waveSection.wave}
          sets={waveSection.sets}
          totalInWave={waveSection.totalCount}
          collectionCount={waveSection.collectionCount}
        />
      ))}
    </div>
  );
}

type WaveSectionProps = {
  wave: Wave;
  sets: SetViewModel[];
  totalInWave: number;
  collectionCount?: number;
};

function WaveSection({
  wave,
  sets,
  totalInWave,
  collectionCount,
}: WaveSectionProps) {
  const isComplete =
    collectionCount !== undefined && collectionCount === totalInWave;

  return (
    <div className="mb-8">
      <SubsectionHeading>
        <span className={`inline-flex items-center gap-2`}>
          {wave}
          {isComplete && (
            <CheckCircleIcon
              className="h-5 w-5 shrink-0 text-success-600"
              aria-hidden
            />
          )}
        </span>
        {collectionCount !== undefined && (
          <span className="ml-2 font-normal text-default-500">
            ({collectionCount} of {totalInWave} sets)
          </span>
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
