import React, { useState } from "react";
import { Button, Typography, Grid, Box } from "@mui/material";
import {
  Microfrontend,
  Registry,
  RegistryTypeDefinition,
  getAppModule,
} from "@definitions/RegistryDefinition";
import { Field, renderInput } from "./RegistryModuleEditor";

interface Props {
  registry: Registry;
  onUpdateRegistry: (registry: Registry) => void;
}

export const RegistryTwinEditor = ({ registry, onUpdateRegistry }: Props) => {
  const { modules, config } = registry;
  const [item, setEditedItem] = useState<Microfrontend>(getAppModule(config) as Microfrontend);

  const handleItemChange = (name: keyof Microfrontend, newValue: any) => {
    if (item) {
      const updated = { ...item, [name]: newValue } as any;
      setEditedItem((prevItem) => ({ ...prevItem, [name]: newValue }) as any);
    }
  };

  const handleUpdateRegistry = () => {
    onUpdateRegistry(registry);
  };

  return (
    <Grid item sx={{ width: "100%" }}>
      <Box style={{ padding: 20 }}>
        <>
          <Typography variant="body1">{`Edit ${item.label}`}</Typography>
          <form>
            {Object.keys(item).map((property) => {
              const fieldName = property as keyof Microfrontend;
              const field: Field = {
                label: property,
                name: fieldName,
                // @ts-ignore
                ...RegistryTypeDefinition[fieldName],
              };
              return (
                <div
                  key={fieldName.toString()}
                  style={{ marginBottom: 20, marginTop: 40, position: "relative" }}
                >
                  {renderInput({
                    registry: modules,
                    field,
                    value: item[fieldName],
                    onChange: (newValue: any) => handleItemChange(fieldName, newValue),
                  })}
                </div>
              );
            })}
            <Button variant="contained" onClick={handleUpdateRegistry}>
              Update
            </Button>
          </form>
        </>
      </Box>
    </Grid>
  );
};
