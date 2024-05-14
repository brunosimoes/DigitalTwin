import React from "react";
import { Grid, List } from "@mui/material";
import { Microfrontend, RegistryModules } from "@definitions/RegistryDefinition";
import { RegistryItem, Status } from "./RegistryItem";

interface Props {
  registry: RegistryModules;
  onUpdateRegistry: (registry: RegistryModules) => void;
  onModuleSelected: (key: string | null) => void;
}
const RegistryModuleList: React.FC<Props> = ({ registry, onUpdateRegistry, onModuleSelected }) => {
  const [onlineStatus, setOnlineStatus] = React.useState<{ [key: string]: Status }>({});

  React.useEffect(() => {
    const checkStatus = async () => {
      const statuses: { [key: string]: Status } = {};
      for (const key of Object.keys(registry)) {
        const container = registry[key] as Microfrontend;
        const url = container.remote ?? container.url ?? "";
        if (!url) {
          statuses[key] = Status.NoHealthCheck;
        } else {
          const isOnline = await fetch(url)
            .then((response) => (response.ok ? Status.Online : Status.Offline))
            .catch(() => Status.Offline);
          statuses[key] = isOnline;
        }
        setOnlineStatus({ ...statuses });
      }
      setOnlineStatus({ ...statuses }); // Create a new object before setting state
    };

    checkStatus();
  }, [registry]);

  const handleDeleteItem = (key: string) => {
    const updatedRegistry = { ...registry };
    delete updatedRegistry[key];
    onUpdateRegistry(updatedRegistry);
  };

  return (
    <Grid item sx={{ width: "100%" }}>
      <List sx={{ width: "100%" }}>
        {Object.keys(registry).map((key: string) => {
          const container = registry[key] as Microfrontend;
          const isOnline = onlineStatus[key] ?? Status.Unknown;
          return (
            <RegistryItem
              key={key}
              container={container}
              isOnline={isOnline}
              onActionClick={() => handleDeleteItem(key)}
              onSelect={() => onModuleSelected(key)}
              tags={[container.version ?? ""]}
            />
          );
        })}
      </List>
    </Grid>
  );
};

export default RegistryModuleList;
