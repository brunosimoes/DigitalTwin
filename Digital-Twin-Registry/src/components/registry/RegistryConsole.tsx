import React from "react";
import { Grid, List, Button, CircularProgress } from "@mui/material";
import {
  ModuleWithFederation,
  RegistryModules,
  getRegistryBaseURL,
} from "@definitions/RegistryDefinition";
import { RegistryItem, Status } from "./RegistryItem";
import { Edit } from "@mui/icons-material";

interface Props {
  registry: RegistryModules;
  onUpdateRegistry: (registry: RegistryModules) => void;
}

const baseURL = getRegistryBaseURL();

const RegistryConsole: React.FC<Props> = ({ registry, onUpdateRegistry }) => {
  const [onlineStatus, setOnlineStatus] = React.useState<{ [key: string]: Status }>({});
  const [isFetching, setIsFetching] = React.useState<boolean>(false);
  const [output, setOutput] = React.useState<string>("");

  React.useEffect(() => {
    const checkStatus = async () => {
      const statuses: { [key: string]: Status } = {};
      for (const key of Object.keys(registry)) {
        const container = registry[key] as ModuleWithFederation;
        const url = container.remote ?? container.url ?? "";
        if (!url) {
          statuses[key] = Status.NoHealthCheck;
        } else {
          const isOnline = await fetch(url)
            .then((response) => (response.ok ? Status.Online : Status.Offline))
            .catch(() => Status.Offline);
          statuses[key] = isOnline;
        }
      }
      setOnlineStatus(statuses);
    };

    checkStatus();
  }, [registry]);

  const handleRecompileItem = async (key: string) => {
    setIsFetching(true);
    try {
      const response = await fetch(`${baseURL}/orchestrator`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ option: "recompile", id: key }),
      });
      if (response.ok) {
        const data = await response.text(); // Parse response body as JSON
        setOutput(data);
      } else {
        const errorData = await response.text(); // Get error message from response body
        setOutput(errorData);
      }
    } catch (error: any) {
      setOutput(error.message); // Use error message
    } finally {
      setIsFetching(false);
    }
  };

  const handleAction = async (action: string) => {
    setIsFetching(true);
    try {
      const response = await fetch(`${baseURL}/orchestrator`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ option: action }),
      });
      if (response.ok) {
        const data = await response.text(); // Parse response body as JSON
        setOutput(data);
      } else {
        const errorData = await response.text(); // Get error message from response body
        setOutput(errorData);
      }
    } catch (error: any) {
      setOutput(error.message); // Use error message
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <>
      <Grid
        container
        item
        sx={{ width: "70vw", marginTop: "10px" }}
        spacing={2}
        justifyContent="center"
      >
        <Grid item>
          <Button variant="outlined" onClick={() => handleAction("configure")}>
            Configure
          </Button>
        </Grid>
        <Grid item>
          <Button variant="outlined" onClick={() => handleAction("build")}>
            Build
          </Button>
        </Grid>
        <Grid item>
          <Button variant="outlined" onClick={() => handleAction("clear")}>
            Clear
          </Button>
        </Grid>
        <Grid item>
          <Button variant="outlined" onClick={() => handleAction("run")}>
            Run
          </Button>
        </Grid>
        <Grid item>
          <Button variant="outlined" onClick={() => handleAction("restart")}>
            Restart
          </Button>
        </Grid>
        <Grid item>
          <Button variant="outlined" onClick={() => handleAction("push")}>
            Push
          </Button>
        </Grid>
        <Grid item>
          <Button variant="outlined" onClick={() => handleAction("pull")}>
            Pull
          </Button>
        </Grid>
        <Grid item>
          <Button variant="outlined" onClick={() => handleAction("createPBC")}>
            Create PBC
          </Button>
        </Grid>
      </Grid>
      <Grid item sx={{ width: "70vw", margin: "10px" }} justifyContent="center">
        {output}
      </Grid>

      {isFetching && (
        <Grid item sx={{ width: "70vw", margin: "10px" }} justifyContent="center">
          <CircularProgress />
        </Grid>
      )}
      <Grid item sx={{ width: "70vw" }}>
        <List sx={{ width: "100%" }}>
          {Object.keys(registry).map((key: string) => {
            const container = registry[key] as ModuleWithFederation;
            const isOnline = onlineStatus[key] ?? Status.Unknown;
            return (
              <RegistryItem
                key={key}
                container={container}
                isOnline={isOnline}
                onActionClick={() => handleRecompileItem(key)}
                onSelect={() => {}}
                tags={[container.version ?? ""]}
                icon={<Edit />}
              />
            );
          })}
        </List>
      </Grid>
    </>
  );
};

export default RegistryConsole;
