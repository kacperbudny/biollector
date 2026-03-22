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

export enum BionicleCharacter {
  HEWKII = "Hewkii",
  MACKU = "Macku",
  JALLER = "Jaller",
  KONGU = "Kongu",
  MATORO = "Matoro",
  NORIK = "Norik",
  IRUINI = "Iruini",
  HAKANN = "Hakann",
  THOK = "Thok",
  TAHU = "Tahu",
  GRESH = "Gresh",
  TAKUA = "Takua",
  SKRALL = "Skrall",
  LHIKAN = "Lhikan",
  POHATU = "Pohatu",
  ONUA = "Onua",
  GALI = "Gali",
  LEWA = "Lewa",
  KOPAKA = "Kopaka",
  VAKAMA = "Vakama",
  NOKAMA = "Nokama",
  WHENUA = "Whenua",
  MATAU = "Matau",
  ONEWA = "Onewa",
  NUJU = "Nuju",
  HAFU = "Hafu",
  GAHLOK = "Gahlok",
  KOHRAK = "Kohrak",
  LEHVAK = "Lehvak",
  PAHRAK = "Pahrak",
  TAHNOK = "Tahnok",
  NUHVOK = "Nuhvok",
  NUPARU = "Nuparu",
  HAHLI = "Hahli",
  MAKUTA = "Makuta",
  REIDAK = "Reidak",
  ZAKTAN = "Zaktan",
  VEZON = "Vezon",
  AVAK = "Avak",
  VEZOK = "Vezok",
  DEKAR = "Dekar",
  KALMAH = "Kalmah",
  TAKADOX = "Takadox",
  EHLEK = "Ehlek",
  PRIDAK = "Pridak",
  MANTAX = "Mantax",
  CARAPAR = "Carapar",
  ANTROZ = "Antroz",
  MATA_NUI = "Mata Nui",
  EKIMU = "Ekimu",
  UMARAK = "Umarak",
}

export type BionicleMinifigure = {
  character: BionicleCharacter;
  variation?: string;
};

type BionicleSetBase = {
  catalogNumber: string;
  name: string;
  releaseYear: string;
  setType: SetType;
  imageName: string;
  wave: Wave;
};

type BionicleSetWithCharacters = BionicleSetBase & {
  characters: BionicleCharacter[];
  minifigures?: never;
};

type BionicleSetWithMinifigures = BionicleSetBase & {
  characters?: never;
  minifigures: BionicleMinifigure[];
};

type BionicleSetWithoutCharacterData = BionicleSetBase & {
  characters?: undefined;
  minifigures?: undefined;
};

export type BionicleSet =
  | BionicleSetWithCharacters
  | BionicleSetWithMinifigures
  | BionicleSetWithoutCharacterData;
