export enum SetType {
  SMALL = "Small",
  CANISTER = "Canister",
  TITAN = "Titan",
  VEHICLE = "Vehicle",
  PLAYSET = "Playset",
}

export enum Wave {
  TOHUNGA = "Tohunga",
  TOA_MATA = "Toa Mata",
  TOA_INIKA = "Toa Inika",
}

export type BionicleSet = {
  catalogNumber: string;
  name: string;
  releaseYear: string;
  setType: SetType;
  imageName: string;
  wave: Wave;
  // character
};

export const bionicleSets = [
  {
    catalogNumber: "8534",
    name: "Tahu",
    releaseYear: "2001",
    setType: SetType.CANISTER,
    wave: Wave.TOA_MATA,
    imageName: "8534.png",
  },
  {
    catalogNumber: "8533",
    name: "Gali",
    releaseYear: "2001",
    setType: SetType.CANISTER,
    wave: Wave.TOA_MATA,
    imageName: "8533.webp",
  },
  {
    catalogNumber: "8535",
    name: "Lewa",
    releaseYear: "2001",
    setType: SetType.CANISTER,
    wave: Wave.TOA_MATA,
    imageName: "8535.jpg",
  },
  {
    catalogNumber: "8531",
    name: "Pohatu",
    releaseYear: "2001",
    setType: SetType.CANISTER,
    wave: Wave.TOA_MATA,
    imageName: "8531.png",
  },
  {
    catalogNumber: "8532",
    name: "Onua",
    releaseYear: "2001",
    setType: SetType.CANISTER,
    wave: Wave.TOA_MATA,
    imageName: "8532.png",
  },
  {
    catalogNumber: "8536",
    name: "Kopaka",
    releaseYear: "2001",
    setType: SetType.CANISTER,
    wave: Wave.TOA_MATA,
    imageName: "8536.webp",
  },
  {
    catalogNumber: "1391",
    name: "Jala",
    releaseYear: "2001",
    setType: SetType.SMALL,
    wave: Wave.TOHUNGA,
    imageName: "1391.webp",
  },
  {
    catalogNumber: "8727",
    name: "Jaller",
    releaseYear: "2006",
    setType: SetType.CANISTER,
    wave: Wave.TOA_INIKA,
    imageName: "8727.png",
  },
] satisfies BionicleSet[];
