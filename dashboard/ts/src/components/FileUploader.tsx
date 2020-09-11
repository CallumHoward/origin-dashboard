import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FormGroup, Input, Label, Form, Button, Alert } from "reactstrap";
import { listVersions, flashOTA } from "..";

const UploadContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const StyledLabel = styled(Label)`
  margin: 0.5rem 0 0.5rem 0;
`;

const StyledButton = styled(Button)`
  margin: 0.5rem 0 0.5rem 0;
`;

const StyledInput = styled(Input)`
  margin: 0.5rem 0 0.5rem 0;
`;

export const FileUploader = () => {
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [versions, setVersions] = useState<string[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string>("");
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);

  useEffect(() => {
    console.log("listing versions");
    listVersions((filenames: string[]) => {
      setVersions(filenames.sort().reverse());
      console.log("got: ", filenames);
    });
  }, [uploadStatus]);

  const onChooseFile = (newFiles: FileList | null) => {
    setUploadStatus("");
    setFiles(newFiles);
  };

  const uploadFile = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!files || files.length < 1) {
      return;
    }
    const xhr = new XMLHttpRequest();
    xhr.addEventListener("error", () => {
      setUploadStatus(`upload failed`);
    });
    xhr.addEventListener("load", () => {
      if (xhr.status == 200) {
        setUploadStatus("file uploaded successfully");
      } else {
        setUploadStatus(
          `file uploaded, but was not 200 OK. HTTP status: ${
            xhr.status
          } Response: ${JSON.stringify(xhr.response)}`
        );
      }
    });
    xhr.open("POST", "http://localhost:2020/upload");
    const formData = new FormData();
    formData.append("myFile", files[0]);
    xhr.send(formData);
  };

  const requestFlash = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    console.log(selectedVersion);
    if (!selectedVersion) {
      return;
    }
    flashOTA(selectedVersion, selectedDevices, () => {
      setUploadStatus("Flashed!");
    });
  };

  return (
    <UploadContainer>
      <Form encType="multipart/form-data">
        <FormGroup>
          <StyledLabel>Upload new version</StyledLabel>
          <StyledInput
            type="file"
            accept=".bin"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onChooseFile(e.target.files)
            }
          />
          <StyledButton type="submit" onClick={uploadFile}>
            Upload
          </StyledButton>
          {!!uploadStatus && <Alert color="primary">{uploadStatus}</Alert>}
        </FormGroup>
      </Form>
      <Form>
        <FormGroup>
          <StyledLabel>Flash with version</StyledLabel>
          <StyledInput
            type="select"
            name="version-selector"
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setSelectedVersion(e.target.value);
            }}
            multiple
          >
            {versions.map((v, i) => (
              <option key={i}>{v}</option>
            ))}
          </StyledInput>
          <StyledButton type="submit" onClick={requestFlash}>
            Flash
          </StyledButton>
        </FormGroup>
      </Form>
    </UploadContainer>
  );
};
