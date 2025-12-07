import { SetCard } from "@/components/set-card";
import { type BionicleSet, bionicleSets, WAVE_ORDER } from "@/data/sets";

function sortSets(a: BionicleSet, b: BionicleSet): number {
  const aWaveIndex = WAVE_ORDER.indexOf(a.wave);
  const bWaveIndex = WAVE_ORDER.indexOf(b.wave);
  const waveCompare = aWaveIndex - bWaveIndex;

  if (waveCompare !== 0) {
    return waveCompare;
  }

  return parseInt(a.catalogNumber, 10) - parseInt(b.catalogNumber, 10);
}

type GroupedSets = {
  label: string;
  items: {
    sublabel: string;
    sets: BionicleSet[];
  }[];
}[];

function groupSetsByYearAndWave(sets: BionicleSet[]): GroupedSets {
  const sortedSets = sets.toSorted(sortSets);

  const groupedByYear = Object.groupBy(sortedSets, (set) => set.releaseYear);

  const result: GroupedSets = Object.entries(groupedByYear)
    .toSorted(([yearA], [yearB]) => yearA.localeCompare(yearB))
    .map(([year, yearSets]) => {
      const groupedByWave = Object.groupBy(
        yearSets as BionicleSet[],
        (set) => set.wave,
      );

      const items = Object.entries(groupedByWave)
        .toSorted(([waveA], [waveB]) => waveA.localeCompare(waveB))
        .map(([wave, waveSets]) => ({
          sublabel: wave,
          sets: (waveSets as BionicleSet[]).toSorted(sortSets),
        }));

      return {
        label: year,
        items,
      };
    });

  return result;
}

export default function Home() {
  const groupedSets = groupSetsByYearAndWave(bionicleSets);

  return (
    <div className="pt-8 flex flex-col items-center justify-center">
      <div className="w-full">
        {groupedSets.flatMap((yearGroup) => (
          <div key={yearGroup.label}>
            <h2>{yearGroup.label}</h2>
            <div>
              {yearGroup.items.flatMap((waveGroup) => (
                <div key={waveGroup.sublabel}>
                  <h3>{waveGroup.sublabel}</h3>
                  <div className="gap-4 grid-cols-[repeat(auto-fit,240px)] grid w-full justify-center">
                    {waveGroup.sets.map((set) => (
                      <SetCard set={set} key={set.catalogNumber} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
