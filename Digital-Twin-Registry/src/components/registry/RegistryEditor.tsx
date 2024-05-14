import React, { useState } from "react";
import { Registry, RegistryModules } from "@definitions/RegistryDefinition";
import {
  Grid,
  Dialog,
  DialogContent,
  IconButton,
  Typography,
  DialogTitle,
  Stack,
  Tabs,
  Tab,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RegistryModuleList from "./RegistryModuleList";
import { RegistryModuleEditor } from "./RegistryModuleEditor";
import { RegistryTwinEditor } from "./RegistryTwinEditor";
import RegistryConsole from "./RegistryConsole";
import { RegistryCreatePBC } from "./RegistryCreatePBC";

interface ContentProps {
  registry: Registry;
  onUpdateRegistry: (registry: Registry) => void;
}

const RegistryDialogContent: React.FC<ContentProps> = ({ registry, onUpdateRegistry }) => {
  const [workingRegistry, setRegistry] = useState<Registry>(registry);
  const [moduleId, setModuleId] = useState<string | null>(null);
  const [isRegistryModule, setRegistryModule] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("digital-twin");

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: string) => {
    setActiveTab(newValue);
  };

  const handleRegistrySelectItem = (key: string | null) => {
    setModuleId(key);
    setRegistryModule(true);
    setActiveTab("registry-module");
  };

  const handleSelectItem = (key: string | null) => {
    setModuleId(key);
    setRegistryModule(false);
    setActiveTab("module");
  };

  const onUpdateModule = (modules: RegistryModules) => {
    setModuleId(null);
    setRegistry({ ...workingRegistry, modules });
    onUpdateRegistry({ ...workingRegistry, modules });
  };

  const onUpdateAppModule = (modules: RegistryModules) => {
    setModuleId(null);
    const update = {
      ...workingRegistry,
      app: { modules, appManifest: workingRegistry.app.appManifest },
    };
    setRegistry(update);
    onUpdateRegistry(update);
  };

  const onUpdateAppManifest = (reg: Registry) => {
    setModuleId(null);
    setActiveTab("digital-twin");
    setRegistry(reg);
    onUpdateRegistry(reg);
  };

  if (!registry)
    return (
      <Stack sx={{ height: "100%", alignItems: "center", justifyContent: "center" }}>
        <h2>
          Apologies, we encountered a hiccup while fetching the registry data. Please check your
          internet connection and try again later.
        </h2>
      </Stack>
    );

  return (
    <Grid container spacing={2} sx={{ width: "100%" }}>
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ width: "100%" }}>
        <Tab label="Registry" value="registry" />
        <Tab label="Digital Twin" value="digital-twin" />
        <Tab label="Digital Twin Modules" value="modules" />
        {moduleId && isRegistryModule && <Tab label="Module" value="registry-module" />}
        {moduleId && !isRegistryModule && <Tab label="Module" value="module" />}
        <Tab label="Console" value="console" />
        <Tab label="New Module" value="create" />
      </Tabs>
      <Box hidden={activeTab !== "registry"} sx={{ width: "100%" }}>
        <RegistryModuleList
          registry={workingRegistry.modules}
          onModuleSelected={handleRegistrySelectItem}
          onUpdateRegistry={onUpdateModule}
        />
      </Box>

      <Box hidden={activeTab !== "digital-twin"} sx={{ width: "100%" }}>
        <RegistryTwinEditor registry={workingRegistry} onUpdateRegistry={onUpdateAppManifest} />
      </Box>

      <Box hidden={activeTab !== "modules"} sx={{ width: "100%" }}>
        <RegistryModuleList
          registry={workingRegistry.app.modules}
          onModuleSelected={handleSelectItem}
          onUpdateRegistry={onUpdateAppModule}
        />
      </Box>

      <Box hidden={activeTab !== "registry-module"} sx={{ width: "100%" }}>
        <RegistryModuleEditor
          registry={workingRegistry.modules}
          moduleId={moduleId}
          onUpdateRegistry={onUpdateModule}
        />
      </Box>

      <Box hidden={activeTab !== "module"} sx={{ width: "100%" }}>
        <RegistryModuleEditor
          registry={workingRegistry.app.modules}
          moduleId={moduleId}
          onUpdateRegistry={(data) => {}}
        />
      </Box>

      <Box hidden={activeTab !== "console"} sx={{ width: "100%" }}>
        <RegistryConsole registry={workingRegistry.app.modules} onUpdateRegistry={(data) => {}} />
      </Box>

      <Box hidden={activeTab !== "create"} sx={{ width: "100%" }}>
        <RegistryCreatePBC registry={workingRegistry.app.modules} onUpdateRegistry={(data) => {}} />
      </Box>
    </Grid>
  );
};

interface Props {
  registry: Registry;
  onUpdateRegistry: (registry: Registry) => void;
  onClose: () => void;
}

const RegistryEditor: React.FC<Props> = ({ registry, onUpdateRegistry, onClose }) => {
  return (
    <Dialog open={true} maxWidth={"xl"}>
      <DialogTitle>
        <Stack direction="row">
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Registry Editor
          </Typography>
          <IconButton onClick={onClose} sx={{ ml: "auto" }}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <RegistryDialogContent registry={registry} onUpdateRegistry={onUpdateRegistry} />
      </DialogContent>
    </Dialog>
  );
};

export default RegistryEditor;
