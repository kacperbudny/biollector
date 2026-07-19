import { parseAsArrayOf, parseAsStringEnum, parseAsStringLiteral } from "nuqs";
import {
  COLLECTION_FILTER_VALUES,
  RATING_FILTER_VALUES,
  RELEASE_YEARS,
  WISHLIST_FILTER_VALUES,
} from "@/domain/set-filter";
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
  collection: parseAsStringLiteral(COLLECTION_FILTER_VALUES),
  wishlist: parseAsArrayOf(
    parseAsStringLiteral(WISHLIST_FILTER_VALUES),
  ).withDefault([]),
  userRatings: parseAsArrayOf(
    parseAsStringLiteral(RATING_FILTER_VALUES),
  ).withDefault([]),
  averageRatings: parseAsArrayOf(
    parseAsStringLiteral(RATING_FILTER_VALUES),
  ).withDefault([]),
};
