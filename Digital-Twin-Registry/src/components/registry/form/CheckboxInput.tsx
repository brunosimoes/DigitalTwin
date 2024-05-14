import React from "react";
import { Checkbox, FormControlLabel } from "@mui/material";

interface Props {
  label: string;
  name: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

/**
 * CheckboxInput is a component that renders a checkbox with a label.
 * @param {Props} props - The props for the CheckboxInput component.
 * @returns {JSX.Element} A JSX element representing a checkbox input with a label.
 */
const CheckboxInput: React.FC<Props> = ({ label, name, value, onChange }) => (
  <FormControlLabel
    control={<Checkbox checked={value} onChange={(e) => onChange(e.target.checked)} name={name} />}
    label={label}
  />
);

export default CheckboxInput;
