import React, { useState } from "react";
import styled from "styled-components";
import { FormGroup, Input, Label, Form, Button } from "reactstrap";

const UploadContainer = styled.div`
  display: flex;
  div {
    width: 100%;
  }
`;

const VersionSelector = styled.div`
  height: 100%;
  overflow-y: scroll;
`;

export const FileUploader = () => {
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [files, setFiles] = useState<FileList | null>(null);

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
    xhr.addEventListener("error", (event) => {
      setUploadStatus(`upload failed`);
    });
    xhr.addEventListener("load", (event) => {
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
    <UploadContainer>
      <div>
        <Form encType="multipart/form-data">
          <Input
            type="file"
            accept=".bin"
            onChange={(e) => onChooseFile(e.target.files)}
          />
          <p>{uploadStatus}</p>
          <Button type="submit" onClick={uploadFile}>
            Upload
          </Button>
        </Form>
      </div>
      <FormGroup>
        <Label>Flash with version</Label>
        <Input type="select" name="version-selector" multiple>
          <option>upload-123.bin</option>
          <option>upload-123.bin</option>
          <option>upload-123.bin</option>
          <option>upload-123.bin</option>
          <option>upload-123.bin</option>
        </Input>
        <Button>Flash</Button>
      </FormGroup>
    </UploadContainer>
  );
};
