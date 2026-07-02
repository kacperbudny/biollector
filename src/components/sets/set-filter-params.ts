import { parseAsArrayOf, parseAsStringEnum, parseAsStringLiteral } from "nuqs";
import { RELEASE_YEARS } from "@/domain/set-filter";
import { BionicleCharacter, SetType, Wave } from "@/domain/sets";

export const filterParamDescriptors = {
  years: parseAsArrayOf(parseAsStringLiteral(RELEASE_YEARS)).withDefault([]),
  types: parseAsArrayOf(
    parseAsStringEnum<SetType>(Object.values(SetType)),
  ).withDefault([]),
  waves: parseAsArrayOf(
    parseAsStringEnum<Wave>(Object.values(Wave)),
  ).withDefault([]),
  characters: parseAsArrayOf(
    parseAsStringEnum<BionicleCharacter>(Object.values(BionicleCharacter)),
  ).withDefault([]),
};
