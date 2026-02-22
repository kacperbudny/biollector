import { type BionicleSet, WAVE_ORDER, type Wave } from "@/data/sets";

export function getSetsListViewModel(sets: BionicleSet[]) {
  const grouped = groupSetsByYearAndWave(sets);
  const years = getYearsAscending(grouped);

  return years.map((year) => {
    const yearSets = grouped[year];
    const waves = getWavesForYear(yearSets);

    return {
      year,
      waves: waves.map((wave) => ({
        wave,
        sets: yearSets[wave] ?? [],
      })),
    };
  });
}

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
