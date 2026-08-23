import { http } from "@/clients/http";
import { setSearchResultsSchema } from "@/domain/view-models/set-search-result.view-model";

export const setsClient = {
  async searchSets(q: string) {
    const json = await http.get("/api/sets", { searchParams: { q } }).json();
    return setSearchResultsSchema.parse(json);
  },
};
