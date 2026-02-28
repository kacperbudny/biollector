import { SetCard } from "@/components/sets/set-card";
import type { Wave } from "@/data/sets";
import type {
  SetsListViewModel,
  SetViewModel,
} from "@/domain/view-models/set.view-model";

type SetsListProps = {
  data: SetsListViewModel;
};

export function SetsList({ data }: SetsListProps) {
  return (
    <div className="py-8">
      {data.map((yearSection) => (
        <YearSection
          key={yearSection.year}
          year={yearSection.year}
          waves={yearSection.waves}
        />
      ))}
    </div>
  );
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
      <h1 className="mb-6 text-4xl font-bold">{year}</h1>
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
      <h2 className="mb-4 text-2xl font-semibold">{wave}</h2>
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
