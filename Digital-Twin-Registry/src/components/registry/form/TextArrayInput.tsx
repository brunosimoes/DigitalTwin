import React from "react";
import { FormControl, InputLabel, TextField } from "@mui/material";

interface Props<T> {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
}

/**
 * TextArrayInput is a component that renders an array of text fields.
 * @param {Props} props - The props for the TextArrayInput component.
 * @returns {JSX.Element} A JSX element representing an array of text fields.
 */
const TextArrayInput: React.FC<Props<any>> = ({ label, value, onChange }) => (
  <FormControl fullWidth>
    <InputLabel>{label}</InputLabel>
    {value.map((text, index) => (
      <TextField
        key={index}
        value={text}
        onChange={(e) => {
          const newArray = [...value];
          newArray[index] = e.target.value;
          onChange(newArray);
        }}
        fullWidth
      />
    ))}
  </FormControl>
);

export default TextArrayInput;
