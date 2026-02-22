import { Card, CardBody, CardHeader } from "@heroui/card";
import type { Metadata } from "next";
import Image from "next/image";
import {
  type BionicleSet,
  bionicleSets,
  WAVE_ORDER,
  type Wave,
} from "@/data/sets";

export const metadata: Metadata = {
  title: "Sets",
  description: "Browse all Bionicle sets organized by year and wave",
};

type GroupedSets = {
  [year: string]: {
    [wave in Wave]?: BionicleSet[];
  };
};

function groupSetsByYearAndWave(sets: BionicleSet[]): GroupedSets {
  const grouped: GroupedSets = {};

  for (const set of sets) {
    if (!grouped[set.releaseYear]) {
      grouped[set.releaseYear] = {};
    }
    const waveSets = grouped[set.releaseYear][set.wave] ?? [];
    waveSets.push(set);
    grouped[set.releaseYear][set.wave] = waveSets;
  }

  return grouped;
}

function getYearsAscending(grouped: GroupedSets): string[] {
  return Object.keys(grouped).sort((a, b) => Number(a) - Number(b));
}

function getWavesForYear(yearSets: { [wave in Wave]?: BionicleSet[] }): Wave[] {
  const wavesInYear = Object.keys(yearSets) as Wave[];
  return WAVE_ORDER.filter((wave) => wavesInYear.includes(wave));
}

export default function SetsPage() {
  const grouped = groupSetsByYearAndWave(bionicleSets);
  const years = getYearsAscending(grouped);

  return (
    <div className="py-8">
      {years.map((year) => {
        const yearSets = grouped[year];
        const waves = getWavesForYear(yearSets);

        return (
          <div key={year} className="mb-12">
            <h1 className="text-4xl font-bold mb-6">{year}</h1>

            {waves.map((wave) => {
              const sets = yearSets[wave] || [];

              return (
                <div key={wave} className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">{wave}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                    {sets.map((set) => (
                      <Card
                        key={set.catalogNumber}
                        isPressable
                        className="hover:scale-105 transition-transform overflow-hidden"
                      >
                        <CardHeader className="p-0">
                          <div className="relative w-full aspect-square min-h-[120px] bg-default-100">
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
                          <h3 className="font-semibold text-sm mb-1">
                            {set.name}
                          </h3>
                          <p className="text-xs text-default-500">
                            {set.releaseYear} • {wave}
                          </p>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
