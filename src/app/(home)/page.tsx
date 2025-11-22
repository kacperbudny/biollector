import { SetCard } from "@/components/set-card";
import { type BionicleSet, bionicleSets, SetType } from "@/data/sets";

const SET_TYPE_ORDER: SetType[] = [
  SetType.SMALL,
  SetType.CANISTER,
  SetType.TITAN,
  SetType.VEHICLE,
  SetType.PLAYSET,
];

function sortSets(a: BionicleSet, b: BionicleSet): number {
  // 1. Sort by release year
  const yearCompare = a.releaseYear.localeCompare(b.releaseYear);
  if (yearCompare !== 0) return yearCompare;

  // 2. Sort by set type
  const aTypeIndex = SET_TYPE_ORDER.indexOf(a.setType);
  const bTypeIndex = SET_TYPE_ORDER.indexOf(b.setType);
  const typeCompare = aTypeIndex - bTypeIndex;
  if (typeCompare !== 0) return typeCompare;

  // 3. Sort by wave alphabetically
  const waveCompare = a.wave.localeCompare(b.wave);
  if (waveCompare !== 0) return waveCompare;

  // 4. Sort by catalog number ascending
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
  // First sort all sets
  const sortedSets = sets.toSorted(sortSets);

  // Group by year
  const groupedByYear = Object.groupBy(sortedSets, (set) => set.releaseYear);

  // Transform into the desired structure
  const result: GroupedSets = Object.entries(groupedByYear)
    .sort(([yearA], [yearB]) => yearA.localeCompare(yearB))
    .map(([year, yearSets]) => {
      // Group sets within this year by wave
      const groupedByWave = Object.groupBy(
        yearSets as BionicleSet[],
        (set) => set.wave,
      );

      // Transform wave groups into items array, sorted alphabetically by wave
      const items = Object.entries(groupedByWave)
        .sort(([waveA], [waveB]) => waveA.localeCompare(waveB))
        .map(([wave, waveSets]) => ({
          sublabel: wave,
          sets: (waveSets as BionicleSet[]).toSorted((a, b) => {
            // Within wave, sort by set type then catalog number
            const aTypeIndex = SET_TYPE_ORDER.indexOf(a.setType);
            const bTypeIndex = SET_TYPE_ORDER.indexOf(b.setType);
            const typeCompare = aTypeIndex - bTypeIndex;
            if (typeCompare !== 0) return typeCompare;
            return (
              parseInt(a.catalogNumber, 10) - parseInt(b.catalogNumber, 10)
            );
          }),
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
      <div className="gap-4 grid-cols-[repeat(auto-fit,240px)] grid w-full justify-center">
        {groupedSets.flatMap((yearGroup) =>
          yearGroup.items.flatMap((waveGroup) =>
            waveGroup.sets.map((set) => (
              <SetCard set={set} key={set.catalogNumber} />
            )),
          ),
        )}
      </div>
    </div>
  );
}
