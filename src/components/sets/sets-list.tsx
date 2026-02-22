import { Card, CardBody, CardHeader } from "@heroui/card";
import Image from "next/image";
import { setsRepository } from "@/data/repositories/sets.repository";
import type { BionicleSet, Wave } from "@/data/sets";
import { getSetsListViewModel } from "@/services/sets.service";

export function SetsList() {
  const sets = setsRepository.getAll();
  const data = getSetsListViewModel(sets);

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
  waves: { wave: Wave; sets: BionicleSet[] }[];
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
  sets: BionicleSet[];
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
  sets: BionicleSet[];
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

type SetCardProps = {
  set: BionicleSet;
  wave: Wave;
};

function SetCard({ set, wave }: SetCardProps) {
  return (
    <Card
      isPressable
      className="overflow-hidden transition-transform hover:scale-105"
    >
      <CardHeader className="p-0">
        <div className="relative aspect-square min-h-[120px] w-full bg-default-100">
          <Image
            src={`/sets/${set.imageName}`}
            alt={set.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 16vw"
          />
        </div>
      </CardHeader>
      <CardBody className="px-3 py-2">
        <h3 className="mb-1 text-sm font-semibold">{set.name}</h3>
        <p className="text-xs text-default-500">
          {set.releaseYear} • {wave}
        </p>
      </CardBody>
    </Card>
  );
}
