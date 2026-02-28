import { SetCard } from "@/components/sets/set-card";
import {
  SectionHeading,
  SubsectionHeading,
} from "@/components/typography/headings";
import type { Wave } from "@/data/sets";
import type {
  SetsListViewModel,
  SetViewModel,
} from "@/domain/view-models/set.view-model";

type SetsListProps = {
  data: SetsListViewModel;
};

export function SetsList({ data }: SetsListProps) {
  return data.map((yearSection) => (
    <YearSection
      key={yearSection.year}
      year={yearSection.year}
      waves={yearSection.waves}
    />
  ));
}

type YearSectionProps = {
  year: string;
  waves: {
    wave: Wave;
    sets: SetViewModel[];
  }[];
};

function YearSection({ year, waves }: YearSectionProps) {
  return (
    <div className="mb-12">
      <SectionHeading>{year}</SectionHeading>
      {waves.map((waveSection) => (
        <WaveSection
          key={waveSection.wave}
          wave={waveSection.wave}
          sets={waveSection.sets}
        />
      ))}
    </div>
  );
}

type WaveSectionProps = {
  wave: Wave;
  sets: SetViewModel[];
};

function WaveSection({ wave, sets }: WaveSectionProps) {
  return (
    <div className="mb-8">
      <SubsectionHeading>{wave}</SubsectionHeading>
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
