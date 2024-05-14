import React from "react";
import { TextField, FormControl, InputLabel, Input } from "@mui/material";

interface Props {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
}

/**
 * TextInput is a component that renders a text field input.
 * @param {Props} props - The props for the TextInput component.
 * @returns {JSX.Element} A JSX element representing a text field input.
 */
const TextInput: React.FC<Props> = ({ label, name, value, onChange }) => (
  <FormControl fullWidth>
    <InputLabel htmlFor={name} sx={{ left: "-15px" }}>
      {label}
    </InputLabel>
    <Input id={name} value={value} onChange={(e) => onChange(e.target.value)} fullWidth />
  </FormControl>
);

export default TextInput;
