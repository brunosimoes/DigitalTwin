import React from "react";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

interface Props {
  label: string;
  name: string;
  value: string;
  options?: string[];
  onChange: (value: string) => void;
}

/**
 * SelectInput is a component that renders a select input with options.
 * @param {Props} props - The props for the SelectInput component.
 * @returns {JSX.Element} A JSX element representing a select input with options.
 */
const SelectInput: React.FC<Props> = ({ label, name, value, options = [], onChange }) => (
  <FormControl fullWidth>
    <InputLabel>{label}</InputLabel>
    <Select id={name} value={value} onChange={(e) => onChange(e.target.value as string)} fullWidth>
      {options.map((option) => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

export default SelectInput;
