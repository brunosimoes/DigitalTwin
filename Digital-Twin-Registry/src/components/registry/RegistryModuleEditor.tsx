import React, { useEffect, useState } from "react";
import { Button, Typography, Grid, Box } from "@mui/material";
import {
  DataType,
  Microfrontend,
  Microservice,
  PBC,
  RegistryModules,
  RegistryTypeDefinition,
} from "@definitions/RegistryDefinition";
import VolumesInput from "./form/VolumesInput";
import DependenciesInput from "./form/DependenciesInput";
import NumberInput from "./form/NumberInput";
import SelectInput from "./form/SelectInput";
import CheckboxInput from "./form/CheckboxInput";
import TextInput from "./form/TextInput";
import TextArrayInput from "./form/TextArrayInput";
import KeyValueListInput from "./form/KeyValueListInput";

export interface Field {
  label: string;
  name: string;
  type: DataType;
  options?: string[];
  tooltip?: string;
}

interface RenderInputProps {
  registry: RegistryModules;
  field: Field;
  value: any;
  onChange: (newValue: any) => void;
}

export const renderInput = ({ registry, field, value, onChange }: RenderInputProps) => {
  const label = field.tooltip || field.label;
  switch (field.type) {
    case "select":
      return (
        <SelectInput
          label={label}
          name={field.name as string}
          options={field.options}
          value={value}
          onChange={onChange as any}
        />
      );
    case "checkbox":
      return <CheckboxInput {...{ label, name: field.name as string, value, onChange }} />;
    case "number":
      return <NumberInput {...{ label, name: field.name as string, value, onChange }} />;
    case "text-array":
      return <TextArrayInput {...{ label, value, onChange }} />;
    case "remotes":
      return <DependenciesInput {...{ registry, value, onChange }} />;
    case "volumes":
      return <VolumesInput {...{ value, onChange }} />;
    case "kv":
      return <KeyValueListInput {...{ label, value, onChange }} />;
    case "licenses":
    case "private":
      return <></>;
    default:
      return <TextInput {...{ label: label, name: field.name as string, value, onChange }} />;
  }
};

interface Props {
  registry: RegistryModules;
  moduleId: keyof RegistryModules | null;
  onUpdateRegistry: (registry: RegistryModules) => void;
}

export const RegistryModuleEditor = ({ registry, moduleId, onUpdateRegistry }: Props) => {
  const [item, setEditedItem] = useState<PBC | null>(null);

  useEffect(() => {
    if (moduleId && registry[moduleId]) {
      setEditedItem(registry[moduleId]);
    } else {
      setEditedItem(null);
    }
  }, [moduleId, registry]);

  const handleItemChange = (name: keyof Microfrontend, newValue: any) => {
    if (item) {
      setEditedItem((prevItem) => ({ ...prevItem, [name]: newValue }) as PBC);
    }
  };

  const handleUpdateRegistry = () => {
    if (moduleId && item) {
      registry[moduleId] = item;
      onUpdateRegistry(registry);
    }
  };

  const getMetadata = (fieldName: string) => {
    // @ts-ignore
    return RegistryTypeDefinition[fieldName];
  };

  return (
    <Grid item sx={{ width: "100%" }}>
      {item && (
        <Box style={{ padding: 20 }}>
          <>
            <Typography variant="body1">{`Edit ${item.label}`}</Typography>
            <form>
              {Object.keys(item).map((property) => {
                const fieldName = property as keyof Microfrontend;
                let field: Field = {
                  label: property,
                  name: fieldName,
                  ...getMetadata(fieldName),
                };

                if (fieldName === "dockerImage") {
                  const options = [...getMetadata(fieldName).options];
                  if (!options.includes(item[fieldName])) options.push(item[fieldName]);
                  field = {
                    label: property,
                    name: fieldName,
                    ...getMetadata(fieldName),
                    options,
                  };
                }

                return (
                  <div
                    key={fieldName.toString()}
                    style={{ marginBottom: 20, marginTop: 40, position: "relative" }}
                  >
                    {renderInput({
                      registry,
                      field,
                      // @ts-ignore
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
      )}
    </Grid>
  );
};
