import React from "react";
import { Button, Stack, Typography } from "@mui/material";
import { DigitalTwin, Registry, getAppModule } from "@definitions/RegistryDefinition";

interface Props {
  registry: Registry;
  handleDialogOpen: any;
  handleValidateDialogOpen: any;
}

export const NavigationControls = ({
  registry,
  handleDialogOpen,
  handleValidateDialogOpen,
}: Props) => {
  const { config } = registry;
  const digitalTwin = getAppModule(config) as DigitalTwin;

  if (!digitalTwin)
    return (
      <Stack direction="row" sx={{ p: 2, alignItems: "center" }} spacing={1}>
        <Typography
          sx={{ height: "40px", p: 1, borderRadius: "10px", background: "rgba(0,0,0,0.1)" }}
        >
          Error loading registry
        </Typography>
      </Stack>
    );

  return (
    <Stack direction="row" sx={{ p: 2, alignItems: "center" }} spacing={1}>
      <Typography
        sx={{ p: 1, borderRadius: "10px", background: "rgba(0,0,0,0.1)" }}
      >
        Version: {digitalTwin.version}
      </Typography>
      <Button
        sx={{
          color: "black",
          p: 1,
          borderRadius: "10px",
          background: "rgba(0,0,0,0.1)",
        }}
        onClick={handleDialogOpen}
      >
        Management
      </Button>
      <Button
        sx={{
          color: "black",
          p: 1,
          borderRadius: "10px",
          background: "rgba(0,0,0,0.1)",
        }}
        onClick={handleValidateDialogOpen}
      >
        Validate
      </Button>
    </Stack>
  );
};
