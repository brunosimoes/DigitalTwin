import CheckboxInput from "./form/CheckboxInput";
import KeyValueListInput from "./form/KeyValueListInput";
import React, { useState } from "react";
import SelectInput from "./form/SelectInput";
import TextArrayInput from "./form/TextArrayInput";
import TextInput from "./form/TextInput";
import { Box, Button, Grid, Stack } from "@mui/material";
import { Field, renderInput } from "./RegistryModuleEditor";
import {
  Microfrontend,
  RegistryModules,
  RegistryTypeDefinition,
} from "@definitions/RegistryDefinition";

interface Props {
  registry: RegistryModules;
  onUpdateRegistry: (registry: RegistryModules) => void;
}

export const RegistryCreatePBC = ({ registry, onUpdateRegistry }: Props) => {
  const [templates, setTemplates] = useState<string[]>(["ReactJS"]);
  const [item, setEditedItem] = useState<any>({
    template: "ReactJS",
    id: "Module",
    type: "microfrontend",
    label: "Module",
    rootDir: "./Digital-Twin-Module",
    enableProxy: true,
    proxyPath: "/",
    dockerContainer: "digital-twin-module",
    dockerImage: "Module.dockerfile",
    dockerVolumes: [],
    pathTemplate: "./src/index.html",
    routeCapabilities: "remote.js",
    documentation: "DIGITAL_TWIN_MY_MODULE.md",
    devServerHost: "http://localhost",
    devServerPort: 8061,
  });

  const handleItemChange = (name: string, newValue: any) => {
    if (item) {
      const updated = { ...item, [name]: newValue } as any;
      console.log(JSON.stringify(updated));
      setEditedItem((prevItem: any) => ({ ...prevItem, [name]: newValue }) as any);
    }
  };

  const handleUpdateRegistry = () => { };

  const pps = [
    {
      label: "Docker Image",
      name: "dockerImage",
    },
    {
      label: "Group (default: ux)",
      name: "group",
    },
    {
      label: "Name of the PBC (e.g. Container)",
      name: "label",
    },
    {
      label: "Unique id for PBC registry",
      name: "name",
    },
    {
      label: "Name of the docker container (e.g. digital-twin-${item.label}) that will be created",
      name: "dockerImage",
    },
    {
      label: "Project folder name (default: ${root_dir}/Digital-Twin-$name)",
      name: "rootDir",
    },
    {
      label:
        'List the PBCs that you want to have preconfigured (e.g. "pbcDashboards", "pbcWebRTC", ...)',
      name: "remotes",
    },
    {
      label: "Documentation file name (default: DIGITAL_TWIN_$name.md)",
      name: "documentation",
    },
    {
      label:
        "Volumes (example: data:/home/app/Digital-Twin-$name/static/data, ./data-models:/home/app/Digital-Twin-$name/static/v)",
      name: "dockerVolumes",
    },
    {
      label: "Enable Proxy (default: true):",
      name: "enableProxy",
    },
    {
      label: "Proxy Path (default: /module)",
      name: "proxyPath",
    },
    {
      label: "Dev Server Port (default: 9999)",
      name: "devServerPort",
    },
  ];

  const { template, ...other } = item;

  const getMetadata = (fieldName: string) => {
    // @ts-ignore
    return RegistryTypeDefinition[fieldName];
  };

  return (
    <Grid item sx={{ width: "100%" }}>
      {item && (
        <Box style={{ padding: 20, width: "100%" }}>
          <form>
            <Stack style={{ marginBottom: 20 }} spacing={3}>
              <SelectInput
                label={"Language (options: ReactJS, CSharp, Node)"}
                name={"template"}
                options={templates}
                value={item.template}
                onChange={(newValue: any) => handleItemChange("template", newValue)}
              />
              {Object.keys(other).map((property) => {
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
                      value: item[fieldName],
                      onChange: (newValue: any) => handleItemChange(fieldName, newValue),
                    })}
                  </div>
                );
              })}
            </Stack>
            <Button variant="contained" onClick={handleUpdateRegistry}>
              Create
            </Button>
          </form>
        </Box>
      )}
    </Grid>
  );
};
