import React from "react";
import { DeleteOutline, FiberManualRecord } from "@mui/icons-material";
import { ListItemAvatar, Avatar, IconButton, ListItem, ListItemText } from "@mui/material";
import { Module } from "@definitions/RegistryDefinition";

export enum Status {
  Online,
  NoHealthCheck,
  Unknown,
  Offline,
}

interface RegistryItemProps {
  container: Module;
  isOnline: Status;
  onActionClick: () => void;
  onSelect: () => void;
  tags: string[];
  icon?: any;
}

export const RegistryItem: React.FC<RegistryItemProps> = ({
  container,
  isOnline,
  onActionClick,
  onSelect,
  tags,
  icon,
}) => {
  const getStatusIcon = () => {
    if (isOnline === Status.Online) return <FiberManualRecord style={{ color: "green" }} />;
    else if (isOnline === Status.NoHealthCheck)
      return <FiberManualRecord style={{ color: "grey" }} />;
    else if (isOnline === Status.Unknown) return <FiberManualRecord style={{ color: "yellow" }} />;
    return <FiberManualRecord style={{ color: "red" }} />;
  };

  return (
    <ListItem
      onClick={onSelect}
      sx={{ "width": "100%", "&:hover": { backgroundColor: "#f5f5f5" } }}
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: "transparent" }}>{getStatusIcon()}</Avatar>
      </ListItemAvatar>
      <ListItemText primary={container.label} secondary={tags.join(", ")} />
      <IconButton onClick={onActionClick} color="error">
        {icon ?? <DeleteOutline />}
      </IconButton>
    </ListItem>
  );
};
