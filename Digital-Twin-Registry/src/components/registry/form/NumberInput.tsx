import React from "react";
import { FormControl, InputLabel, Input } from "@mui/material";

interface Props {
  label: string;
  name: string;
  value: number;
  onChange: (value: number) => void;
}

/**
 * NumberInput is a component that renders a text field for entering numeric values.
 * @param {Props} props - The props for the NumberInput component.
 * @returns {JSX.Element} A JSX element representing a text field for entering numeric values.
 */
const NumberInput: React.FC<Props> = ({ label, name, value, onChange }) => (
  <FormControl fullWidth>
    <InputLabel htmlFor={name} sx={{ left: "-15px" }}>
      {label}
    </InputLabel>
    <Input
      id={name}
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      fullWidth
    />
  </FormControl>
);

export default NumberInput;
