import { SearchField } from "@heroui/react";

type SetSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function SetSearchBar({ value, onChange }: SetSearchBarProps) {
  return (
    <SearchField
      fullWidth
      aria-label="Search sets"
      value={value}
      onChange={onChange}
      className="mb-6"
    >
      <SearchField.Group>
        <SearchField.SearchIcon />
        <SearchField.Input placeholder="Search by name, catalog number, year or wave…" />
        <SearchField.ClearButton />
      </SearchField.Group>
    </SearchField>
  );
}
