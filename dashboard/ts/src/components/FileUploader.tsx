import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FormGroup, Input, Label, Form, Button, Alert } from "reactstrap";
import { listVersions } from "..";

const StyledForm = styled(Form)`
  display: flex;
  div {
    width: 100%;
  }
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

  useEffect(() => {
    console.log("listing versions");
    listVersions((filenames: string[]) => {
      setVersions(filenames);
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
    // xhr.upload.addEventListener("progress", (event) => {
    //     if (event.lengthComputable) {
    //         setUploadStatus(`progress: ${event.loaded / event.total}%`);
    //     }
    //     setUploadStatus('uploading... unknown %');
    // });
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
  return (
    <StyledForm>
      <FormGroup>
        <StyledLabel>Upload new version</StyledLabel>
        <Form encType="multipart/form-data">
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
        </Form>
      </FormGroup>
      <FormGroup>
        <StyledLabel>Flash with version</StyledLabel>
        <StyledInput type="select" name="version-selector" multiple>
          {versions.map((v, i) => (
            <option key={i}>{v}</option>
          ))}
        </StyledInput>
        <StyledButton>Flash</StyledButton>
      </FormGroup>
    </StyledForm>
  );
};
