declare module "reactflow" {
  export const Handle = any;
  export interface Handle {
    [key: string]: any;
  }
  export const Position = any;
  export interface Position {
    [key: string]: any;
  }

  export interface Edge {
    [key: string]: any;
  }

  export enum MarkerType {
    ArrowClosed,
  }

  export type Node = any;

  export interface NodeTypes {
    [key: string]: any;
  }

  export const Controls: any;
  export const useEdgesState: any;
  export const useNodesState: any;

  const ReactFlow: any;
  export default ReactFlow;
}
