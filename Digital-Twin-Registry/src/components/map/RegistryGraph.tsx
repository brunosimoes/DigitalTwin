import React, { useEffect } from "react";
import ReactFlow, {
  Controls,
  Edge,
  MarkerType,
  Node,
  NodeTypes,
  useEdgesState,
  useNodesState,
} from "reactflow";
import { PBC } from "@components/map/PBC";
import "./RegistryGraph.css";
import "reactflow/dist/style.css";
import {
  Cluster,
  ModuleWithFederation,
  PBC as PbcType,
  Registry,
  RegistryModules,
  getRegistryBaseURL,
} from "@definitions/RegistryDefinition";
import { Stack } from "@mui/material";

const baseURL = getRegistryBaseURL();

const nodeTypes: NodeTypes = {
  NodeRenderer: PBC,
};

interface Props {
  registry: Registry;
}

/**
 * RegistryGraph is a component that renders a network graph using ReactFlow.
 * @returns {JSX.Element} An element representing the network graph.
 */
export const RegistryGraph = ({ registry }: Props): JSX.Element => {
  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);

  useEffect(() => {
    if (!registry) return;

    const { app } = registry;
    const digitalTwin = app.appManifest;
    const modules = app.modules;

    if (!digitalTwin || !modules) return;

    const fetchRegistryContainers = async () => {
      try {
        const response = await fetch(`${baseURL}/containers`);
        if (response.ok) {
          const serviceList = await response.json();
          setNodes((nds: Node[]) =>
            nds.map((n: Node) => {
              const dockerContainer = n.data.dockerContainer;
              const info = serviceList.find((r: any) => r.Names.includes(`/${dockerContainer}`));
              if (info) {
                const id = info.Id;
                n.data.docker = {
                  id,
                  start: async () => {
                    try {
                      const response = await fetch(`${baseURL}/start-container/${id}`);
                      return response.ok;
                    } catch (e) {}
                    return false;
                  },
                  restart: async () => {
                    try {
                      const response = await fetch(`${baseURL}/restart-container/${id}`);
                      return response.ok;
                    } catch (e) {}
                    return false;
                  },
                  stop: async () => {
                    try {
                      const response = await fetch(`${baseURL}/stop-container/${id}`);
                      return response.ok;
                    } catch (e) {}
                    return false;
                  },
                };
              }
              return n;
            }),
          );
        } else {
          console.error("Failed to fetch service list:", response.status);
        }
      } catch (error: any) {
        console.error(`Error accessing docker service: ${error.message}`);
      }
    };

    // Load groups
    const groups = digitalTwin.groups.map((g: Cluster) => ({
      id: g.id,
      data: {
        name: g.label,
        label: g.label ?? "Group",
      },
      style: g.style,
      className: "nodrag",
      position: g.position ?? { x: 0, y: 0 },
    }));

    // Load JSON data
    const locations: { [key: string]: { x: number; y: number } } = {};
    const getPosition = (group: string) => {
      if (!locations[group]) {
        locations[group] = { x: 50, y: 80 };
      } else {
        locations[group].y += 120;
      }
      return { ...locations[group] };
    };

    const data: Node = Object.keys(modules as RegistryModules)
      .filter((key: string) => {
        return modules[key].servicesMap !== undefined;
      })
      .map((key: string) => {
        const m = modules[key] as PbcType;

        if (!m.servicesMap) m.servicesMap = {} as any;
        m.servicesMap.position = m.servicesMap?.position ?? getPosition(m.servicesMap.group);

        const module = m as ModuleWithFederation;
        const serviceBaseURL = module.url;

        let dockerHealthCheckEndpoint = null;
        if (module.dockerHealthCheck !== false) {
          dockerHealthCheckEndpoint = m.dockerHealthCheckEndpoint
            ? serviceBaseURL + m.dockerHealthCheckEndpoint
            : module.remote
              ? module.remote
              : module.url;

          dockerHealthCheckEndpoint = dockerHealthCheckEndpoint.replace(
            "http://localhost:${PORT}/v1",
            "",
          );
          dockerHealthCheckEndpoint = dockerHealthCheckEndpoint.replace(
            "http://localhost:${PORT}",
            "",
          );
        }

        const n = {
          id: key,
          data: {
            // Uses a user custom dockerHealthCheckEndpoint or the federated endpoint
            dockerHealthCheckEndpoint,

            // If no landing page is defined, it point to container /
            routeLandingPage: serviceBaseURL + (m.routeLandingPage ?? ""),

            // Other
            name: m.label,
            node: m.servicesMap?.node,
            microservices: Object.values(m.microservices ?? {}),
            edges: module?.remotes ?? [],
            dockerContainer: m.dockerContainer,
            upstream: m.servicesMap?.upstream,
          },
          type: "NodeRenderer",
          parentNode: m.servicesMap.group,
          extent: "parent",
          position: m.servicesMap.position,
        };
        return n;
      });

    const getSource = (sourceId: string, targetId: string) => {
      const source = modules[sourceId]?.servicesMap;
      const target = modules[targetId]?.servicesMap;
      if (source?.group && target?.group) {
        const sourceX = groups.find((v) => source.group === v.id)?.position.x ?? 0;
        const targetX = groups.find((v) => target.group === v.id)?.position.x ?? 0;
        const handlerId =
          sourceX < targetX ? "source_right_" + sourceId : "source_left_" + sourceId;
        return handlerId;
      }
    };

    const getTarget = (sourceId: string, targetId: string) => {
      const source = modules[sourceId]?.servicesMap;
      const target = modules[targetId]?.servicesMap;
      if (source?.group && target?.group) {
        const sourceY = source.position.y ?? 0;
        const targetY = target.position.y ?? 0;
        const handlerId =
          sourceY < targetY ? "target_top_" + targetId : "target_bottom_" + targetId;
        return handlerId;
      }
    };

    // Create nodes and edges
    const nodes = [...groups, ...data];

    const edges: Edge = [];
    data.forEach((d: Node) => {
      // Show direct and upstream dependencies.
      const connections = [...d.data.edges, ...(d.data.upstream ?? [])].filter(
        (f) => f !== undefined,
      );

      connections.forEach((dependencyId: string) => {
        edges.push({
          id: `${d.id}-${dependencyId}`,
          source: dependencyId,
          target: d.id,
          sourceHandle: getSource(dependencyId, d.id),
          targetHandle: getTarget(dependencyId, d.id),
          type: "default",
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 0,
            height: 0,
            color: "#000",
          },
          style: {
            strokeWidth: 4,
            stroke: "#000",
          },
        });
      });
    });

    setNodes(nodes);
    setEdges(edges);

    fetchRegistryContainers().then();
  }, [registry]);

  if (nodes.length === 0)
    return (
      <Stack sx={{ height: "100%", alignItems: "center", justifyContent: "center" }}>
        <h2>
          Apologies, we encountered a hiccup while fetching the registry data. Please check your
          internet connection and try again later.
        </h2>
      </Stack>
    );

  return (
    <ReactFlow
      nodeTypes={nodeTypes}
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodesDraggable={false}
      draggable={false}
      fitView
      attributionPosition="bottom-right"
    >
      <Controls />
    </ReactFlow>
  );
};
