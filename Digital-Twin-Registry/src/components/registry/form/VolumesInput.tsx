import React from "react";
import { TextField, Button, Grid, IconButton, Select, MenuItem, Typography } from "@mui/material";
import { AddCircleOutline, DeleteOutline } from "@mui/icons-material";
import { Volume } from "@definitions/RegistryDefinition";

interface Props {
  value: Volume[];
  onChange: (value: Volume[]) => void;
}

/**
 * VolumesInput is a component that renders inputs for managing Docker volumes.
 * @param {Props} props - The props for the VolumesInput component.
 * @returns {JSX.Element} A JSX element representing inputs for managing Docker volumes.
 */
const VolumesInput: React.FC<Props> = ({ value, onChange }) => {
  const handleVolumeChange = (index: number, attributeName: keyof Volume, attributeValue: any) => {
    const newValue = value.map((volume: Volume, i: number) =>
      i === index ? { ...volume, [attributeName]: attributeValue } : volume,
    );
    onChange(newValue);
  };

  const handleDeleteVolume = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
  };

  const handleAddVolume = () => {
    onChange([...value, { source: "", target: "", create: true }]);
  };

  return (
    <Grid container spacing={1}>
      <Grid item xs={12} padding={2}>
        <Typography variant="h5">Docker Volumes</Typography>
      </Grid>
      {value.map((volume, index) => (
        <Grid container spacing={1} alignItems="center" key={index} padding={1}>
          <Grid item xs={4}>
            <TextField
              label={`Volume Source ${index + 1}`}
              value={volume.source}
              onChange={(e) => handleVolumeChange(index, "source", e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label={`Volume Target ${index + 1}`}
              value={volume.target}
              onChange={(e) => handleVolumeChange(index, "target", e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={3}>
            <Select
              value={volume.create ? "Docker Volume" : "System Volume"}
              onChange={(e) =>
                handleVolumeChange(index, "create", e.target.value === "Docker Volume")
              }
              fullWidth
            >
              <MenuItem value="Docker Volume">Docker Volume</MenuItem>
              <MenuItem value="System Volume">System Volume</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={1}>
            <IconButton onClick={() => handleDeleteVolume(index)}>
              <DeleteOutline />
            </IconButton>
          </Grid>
        </Grid>
      ))}
      <Grid item xs={12}>
        <Button
          variant="outlined"
          startIcon={<AddCircleOutline />}
          onClick={handleAddVolume}
          fullWidth
        >
          Add Volume
        </Button>
      </Grid>
    </Grid>
  );
};

export default VolumesInput;
