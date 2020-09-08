import React, { useState } from "react";

export const FileUploader = () => {
    const [uploadStatus, setUploadStatus] = useState<string>("");
    const [files, setFiles] = useState<FileList | null>(null);

    const onChooseFile = (newFiles: FileList | null) => {
        setFiles(newFiles)
    }
    const uploadFile = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (!files || files.length < 1) {
            return;
        }
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "http://192.168.20.18:2020/upload");
        xhr.addEventListener("progress", (event) => {
            setUploadStatus(`progress: ${event.loaded}%`);
        });
        xhr.addEventListener("error", (event) => {
            setUploadStatus(`upload failed`);
        })
        xhr.addEventListener("load", (event) => {
            if (xhr.status == 200) {
                setUploadStatus("file uploaded successfully");
            } else {
                setUploadStatus(`file uploaded, but error occured. HTTP status: ${xhr.status} Response: ${JSON.stringify(xhr.response)}`);
            }
        })
        const formData = new FormData();
        formData.append('myFile', files[0]);
        xhr.send(formData);
    };
    return (
        <div>
            <form encType="multipart/form-data">
                <input type="file" onChange={(e) => onChooseFile(e.target.files)} />
                <p>{uploadStatus}</p>
                <button type="submit" onClick={uploadFile}>submit</button>
            </form>
        </div>
    );
}
