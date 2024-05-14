import React from "react";
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { RegistryModules } from "@definitions/RegistryDefinition";

interface Props {
  registry: RegistryModules;
  value: string[];
  onChange: (value: string[]) => void;
}

/**
 * DependenciesInput is a component that renders a Select input for selecting multiple dependencies.
 * @param {Props} props - The props for the DependenciesInput component.
 * @returns {JSX.Element} A JSX element representing a Select input for selecting multiple dependencies.
 */
const DependenciesInput: React.FC<Props> = ({ registry, value, onChange }) => {
  const handleSelectionChange = (event: any) => {
    const selectedValues = event.target.value as string[];
    onChange(selectedValues);
  };

  return (
    <FormControl fullWidth>
      <InputLabel>PBCs Required</InputLabel>
      <Select
        multiple
        value={value}
        onChange={handleSelectionChange}
        fullWidth
        renderValue={(selected: string[]) => selected?.join(", ")}
      >
        {Object.keys(registry).map((key) => (
          <MenuItem key={key} value={key}>
            {registry[key].label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default DependenciesInput;
