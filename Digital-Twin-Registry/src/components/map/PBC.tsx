import axios from "axios";
import CircleIcon from "@mui/icons-material/Circle";
import React, { ReactNode, memo, useEffect, useState } from "react";
import { Handle, Position, Node } from "reactflow";
import { Menu, MenuItem, Stack, Typography } from "@mui/material";

enum ServiceOptions {
  Open = "Go to service",
  Stop = "Stop service",
  Restart = "Restart service",
  Start = "Start service",
}

/**
 * PBC node in the network graph.
 * @param {Node} node - The component's props object.
 * @returns {JSX.Element} An element representing the service node in the network graph.
 */
export const PBC = (node: Node) => {
  const { data } = node;
  const url = data.dockerHealthCheckEndpoint;
  const serviceURL = data.routeLandingPage;
  const [isOnline, setIsOnline] = useState(url === null);
  const [isLoading, setLoading] = useState(true);
  const color = isOnline ? "#52BE80" : "#A93226";
  const colorStatus = isOnline ? "#1A6E0C" : "#893226";
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(null);
  };

  const handleOptionClick = async (
    e: React.MouseEvent<HTMLLIElement, MouseEvent>,
    option: ServiceOptions,
  ) => {
    if (option === ServiceOptions.Start) {
      setLoading(true);
      setIsOnline(await node.data.docker.start());
      setLoading(false);
    } else if (option === ServiceOptions.Stop) {
      setLoading(true);
      setIsOnline(!(await node.data.docker.stop()));
      setLoading(false);
    } else if (option === ServiceOptions.Restart) {
      setLoading(true);
      await node.data.docker.restart();
      setLoading(false);
    } else if (option === ServiceOptions.Open && isOnline) {
      location.href = serviceURL;
    }
    handleMenuClose(e);
  };

  useEffect(() => {
    if (url) {
      axios
        .get(url)
        .then((response: any) => {
          setIsOnline(response.status === 200);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const NodeBody = ({ children, color }: { children: ReactNode; color: string }) => {
    return (
      <Stack
        direction={"column"}
        spacing={0.5}
        sx={{
          "width": "200px",
          "backgroundColor": color,
          "padding": "10px",
          "borderRadius": "10px",
          "border": "1px solid black",
          "textAlign": "center",
          "alignItems": "center",
          "justifyItems": "center",
          "&:hover": {
            backgroundColor: "#6d6d6d",
          },
        }}
      >
        <Handle
          type="target"
          position={Position.Bottom}
          id={"target_bottom_" + node.id}
          style={{ background: "#555" }}
          isConnectable={false}
        />
        <Handle
          type="target"
          id={"target_top_" + node.id}
          position={Position.Top}
          style={{ background: "#555" }}
          isConnectable={false}
        />

        {children}
        <Handle
          type="source"
          id={"source_right_" + node.id}
          position={Position.Right}
          style={{ background: "#555" }}
          isConnectable={false}
        />
        <Handle
          type="source"
          id={"source_left_" + node.id}
          position={Position.Left}
          style={{ background: "#555" }}
          isConnectable={false}
        />
      </Stack>
    );
  };

  const NodeInfo = memo(() => {
    return (
      <Stack sx={{ alignItems: "center" }}>
        <Stack direction="row">{data.name}</Stack>
        <Stack direction="row" spacing={1}>
          {data.microservices.map((m: { name: string; url?: string }, i: number) => (
            <Stack
              key={data.id + "_microservice_" + i}
              direction="row"
              spacing={0.4}
              sx={{ p: 0.5, alignItems: "center", justifyItems: "center" }}
            >
              <span style={{ fontSize: "10px" }}>{m.name}</span>
              <CircleIcon sx={{ fontSize: "10px", color: colorStatus }} />
            </Stack>
          ))}
        </Stack>
      </Stack>
    );
  });

  if (isLoading)
    return (
      <NodeBody color={"#F1C40F"}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyItems: "center" }}>
          <Stack className="services-loading-spinner"></Stack>
          <Typography sx={{ fontSize: "14px" }}>Checking</Typography>
        </Stack>
        <NodeInfo />
      </NodeBody>
    );

  return (
    <div onClick={handleMenuClick}>
      <NodeBody color={!isOnline ? "#EE204D" : color}>
        {!isOnline ? (
          <>
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", justifyItems: "center" }}
            >
              <Stack className="services-error-spinner"></Stack>
              <Typography sx={{ fontSize: "14px" }}>Offline</Typography>
            </Stack>
            <NodeInfo />
          </>
        ) : (
          <NodeInfo />
        )}
      </NodeBody>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        sx={{ background: "rgba(0,0,0,0,.5)" }}
        slotProps={{
          paper: {
            style: { background: "rgba(255,255,255,255, .5)", borderRadius: "4px", padding: "5px" },
          },
        }}
      >
        {serviceURL && (
          <MenuItem
            onClick={(e) => handleOptionClick(e, ServiceOptions.Open)}
            sx={{
              background: "rgba(255,255,255,0.8)",
              borderRadius: "4px",
              color: isOnline ? "black" : "grey",
            }}
          >
            {ServiceOptions.Open.toString()}
          </MenuItem>
        )}
        {node.data?.docker?.stop && (
          <MenuItem
            onClick={(e) => handleOptionClick(e, ServiceOptions.Stop)}
            style={{ color: isOnline ? "black" : "grey" }}
          >
            {ServiceOptions.Stop.toString()}
          </MenuItem>
        )}
        {node.data?.docker?.restart && (
          <MenuItem
            onClick={(e) => handleOptionClick(e, ServiceOptions.Restart)}
            style={{ color: isOnline ? "black" : "grey" }}
          >
            {ServiceOptions.Restart.toString()}
          </MenuItem>
        )}
        {node.data?.docker?.start && (
          <MenuItem
            onClick={(e) => handleOptionClick(e, ServiceOptions.Start)}
            style={{ color: isOnline ? "grey" : "black" }}
          >
            {ServiceOptions.Start.toString()}
          </MenuItem>
        )}
      </Menu>
    </div>
  );
};
