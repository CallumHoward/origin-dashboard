package upload

import (
	"fmt"
	"io/ioutil"
	"net/http"
)

func uploadFile(w http.ResponseWriter, r *http.Request) {
	fmt.Println("method:", r.Method)
	if r.Method == "POST" {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		// Parse input
		r.ParseMultipartForm(10 << 20) // 10-20 MB

		// Retrieve file
		file, handler, err := r.FormFile("myFile")
		if err != nil {
			fmt.Println("Error Retrieving the file")
			fmt.Println(err)
		}
		defer file.Close()
		fmt.Printf("Uploaded file: %+v\n", handler.Filename)
		fmt.Printf("File Size: %v\n", handler.Size)
		fmt.Printf("MIME Header: %v\n", handler.Header)

		// Write temporary file on our server
		tempFile, err := ioutil.TempFile("uploads", "upload-*.bin")
		if err != nil {
			fmt.Println(err)
		}
		defer tempFile.Close()

		fileBytes, err := ioutil.ReadAll(file)
		if err != nil {
			fmt.Println(err)
		}
		tempFile.Write(fileBytes)

		// Return result
		fmt.Fprintf(w, "Successfully uploaded file\n")
	}
	fmt.Fprintf(w, "Uploading File")
}

func SetupRoutes() {
	http.HandleFunc("/upload", uploadFile)
	http.ListenAndServe(":2020", nil)
}
