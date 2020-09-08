import React, { useState } from "react";

export const FileUploader = () => {
    const [uploadStatus, setUploadStatus] = useState<string>("");
    const [files, setFiles] = useState<FileList | null>(null);

    const onChooseFile = (newFiles: FileList | null) => {
        setUploadStatus("");
        setFiles(newFiles);
    }
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
        })
        xhr.addEventListener("load", (event) => {
            if (xhr.status == 200) {
                setUploadStatus("file uploaded successfully");
            } else {
                setUploadStatus(`file uploaded, but was not 200 OK. HTTP status: ${xhr.status} Response: ${JSON.stringify(xhr.response)}`);
            }
        })
        xhr.open("POST", "http://192.168.20.18:2020/upload");
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
