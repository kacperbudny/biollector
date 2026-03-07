export enum SetType {
  SMALL = "Small",
  CANISTER = "Canister",
  LARGE = "Large",
  PLAYSET = "Playset",
  SPECIAL = "Special",
  COMBINER = "Combiner",
}

// order matters!
export enum Wave {
  // 2001
  TURAGA = "Turaga",
  TOHUNGA = "Tohunga",
  TOA_MATA = "Toa Mata",
  RAHI = "Rahi",

  // 2002
  BOHROK_VA = "Bohrok Va",
  BOHROK = "Bohrok",
  TOA_NUVA = "Toa Nuva",

  // 2003
  MOLTORAN = "MoLtoran",
  BOHROK_KAL = "Bohrok-Kal",
  RAHKSHI = "Rahkshi",

  // 2004
  METRUAN = "Metruan",
  TOA_METRU = "Toa Metru",
  VAHKI = "Vahki",

  // 2005
  RAHAGA = "Rahaga",
  TOA_HORDIKA = "Toa Hordika",
  VISORAK = "Visorak",
  TOA_HAGAH = "Toa Hagah",

  // 2006
  VOYATORAN = "Voyatoran",
  PIRAKA = "Piraka",
  TOA_INIKA = "Toa Inika",

  // 2007
  MAHRITORAN = "Mahritoran",
  HYDRUKA = "Hydruka",
  BARRAKI = "Barraki",
  TOA_MAHRI = "Toa Mahri",

  // 2008
  KARDATORAN = "Kardatoran",
  PHANTOKA = "Phantoka",
  MISTIKA = "Mistika",

  // 2009
  AGORI = "Agori",
  GLATORIAN = "Glatorian",
  GLATORIAN_LEGENDS = "Glatorian Legends",

  // 2010
  STARS = "Stars",

  // 2015
  PROTECTORS = "Protectors",
  TOA_MASTERS = "Toa Masters",
  SKULL_ARMY = "Skull Army",

  // 2016
  ELEMENTAL_CREATURES = "Elemental Creatures",
  TOA_UNITERS = "Toa Uniters",
  SHADOW_HORDE = "Shadow Horde",

  // Generic
  TITANS = "Titans",
  BATTLE_VEHICLES = "Battle Vehicles",
  RELEASED_COMBINERS = "Released Combiners",
  PLAYSETS = "Playsets",
  PROMOTIONAL = "Promotional",
  ACCESSORIES = "Accessories",
  MISCELLANEOUS = "Miscellaneous",
}

export type BionicleSet = {
  catalogNumber: string;
  name: string;
  releaseYear: string;
  setType: SetType;
  imageName: string;
  wave: Wave;
};
