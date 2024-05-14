import React from "react";
import { TextField, Button, Grid, IconButton, Typography } from "@mui/material";
import { AddCircleOutline, DeleteOutline } from "@mui/icons-material";
import { KeyValue } from "@definitions/RegistryDefinition";

interface Props {
  label: string;
  value: { [key: string]: KeyValue };
  onChange: (value: { [key: string]: KeyValue }) => void;
}

const KeyValueListInput: React.FC<Props> = ({ label, value, onChange }) => {
  const handleSettingChange = (
    key: string,
    attributeName: keyof KeyValue,
    attributeValue: string,
  ) => {
    const newValue = {
      ...value,
      [key]: {
        ...(value[key] || {}),
        [attributeName]: attributeValue,
      },
    };
    onChange(newValue);
  };

  const handleDeleteSetting = (key: string) => {
    const newValue = { ...value };
    delete newValue[key];
    onChange(newValue);
  };

  const handleAddSetting = () => {
    const newKey = `New Setting ${Object.keys(value).length + 1}`;
    const newValue = {
      ...value,
      [newKey]: { key: "", value: "" },
    };
    onChange(newValue);
  };

  return (
    <Grid container spacing={1}>
      <Grid item xs={12} padding={2}>
        <Typography variant="h5">{label}</Typography>
      </Grid>
      {Object.keys(value).map((key: string) => (
        <Grid container spacing={1} key={key} alignItems="center" padding={1}>
          <Grid item xs={5}>
            <TextField
              label={`Key`}
              value={key}
              onChange={(e) => handleSettingChange(key, "key", e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label={`Value`}
              value={value[key]}
              onChange={(e) => handleSettingChange(key, "value", e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={1}>
            <IconButton onClick={() => handleDeleteSetting(key)}>
              <DeleteOutline />
            </IconButton>
          </Grid>
        </Grid>
      ))}
      <Grid item xs={12}>
        <Button
          variant="outlined"
          startIcon={<AddCircleOutline />}
          onClick={handleAddSetting}
          fullWidth
        >
          Add Setting
        </Button>
      </Grid>
    </Grid>
  );
};

export default KeyValueListInput;
