import { type BionicleSet, SetType } from "@/data/sets";

export function setFixture(
  overrides: Partial<BionicleSet> &
    Pick<BionicleSet, "catalogNumber" | "name" | "releaseYear" | "wave">,
): BionicleSet {
  return {
    setType: SetType.CANISTER,
    imageName: "test.png",
    ...overrides,
  };
}
