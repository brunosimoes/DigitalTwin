import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Typography,
  ListItem,
  List,
  Stack,
} from "@mui/material";
import { getRegistryBaseURL } from "@definitions/RegistryDefinition";

const baseURL = getRegistryBaseURL();

const JSONValidator = ({ open, setOpen }: any) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fileInputRef.current?.click();
    }
  }, [open]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] as any;
    setSelectedFile(file);
    if (file) {
      readFileContent(file);
    }
  };

  const readFileContent = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target) {
        setFileContent(event.target.result as string);
      }
    };
    reader.readAsText(file);
  };

  const handleValidate = async (event: any, withFederation?: boolean) => {
    if (!fileContent) return;

    setLoading(true);
    try {
      const response = await fetch(`${baseURL}/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: fileContent,
      });

      const data = await response.json();
      if (data.message) {
        setResult(
          <Stack>
            <Typography sx={{ color: "green", paddingBottom: "10px", paddingTop: "10px" }}>
              {data.message}
            </Typography>
          </Stack>,
        );
      } else if (data.errors) {
        setResult(
          <List>
            {data.errors.map((error: any) => (
              <ListItem key={"error" + error.message} sx={{ color: "red" }}>
                {error?.instancePath ?? ""} {error.message}{" "}
                {error?.params?.additionalProperty ?? ""}{" "}
              </ListItem>
            ))}
          </List>,
        );
      }
    } catch (error) {
      console.error("Error:", error);
      setResult("An error occurred while validating the JSON.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth={"xl"}>
      <DialogTitle>JSON Validator</DialogTitle>
      <DialogContent sx={{ width: "100%", minWidth: "60vw" }}>
        <Typography>Select a module.json file to validate:</Typography>
        <form id="jsonForm">
          <input
            type="file"
            id="jsonFile"
            name="jsonFile"
            accept=".json"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <label htmlFor="jsonFile">
            <Button component="span" variant="contained" color="primary" sx={{ marginTop: "20px" }}>
              Choose File
            </Button>
          </label>
          <Button
            variant="contained"
            color="primary"
            onClick={handleValidate}
            disabled={!selectedFile || loading}
            sx={{ marginLeft: "10px", marginTop: "20px" }}
          >
            Validate
          </Button>
          {result}
          {fileContent && (
            <div>
              <Typography variant="subtitle1">File Content:</Typography>
              <pre>{fileContent}</pre>
            </div>
          )}
          {loading && <CircularProgress size={24} />}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JSONValidator;
