package api

import (
	"io"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func PathUpload(ctx *gin.Context) {
	// TODO: add tests

	path := ctx.Param("path")

	if !LocalPathExists(path) {
		ctx.JSON(http.StatusNotFound, gin.H{
			"detail": "Path not found",
		})
		return

	}

	if !LocalIsDirectory(path) {
		ctx.JSON(http.StatusNotAcceptable, gin.H{
			"detail": "Selected path is not a folder",
		})
		return
	}

	file, err := ctx.FormFile("file")
	if err != nil {
		ctx.JSON(400, gin.H{
			"detail": "No file uploaded",
		})
		return
	}

	filename := ctx.PostForm("filename")
	if filename == "" {
		ctx.JSON(400, gin.H{
			"detail": "Missing filename",
		})
		return
	}

	uploadedFile, err := file.Open()
	if err != nil {
		ctx.JSON(500, gin.H{
			"detail": "Error opening the uploaded file",
		})
		return
	}
	defer uploadedFile.Close()

	destination, err := os.Create(path + "/" + filename)
	if err != nil {
		ctx.JSON(500, gin.H{
			"detail": "Error creating the destination file",
		})
		return
	}
	defer destination.Close()

	_, err = io.Copy(destination, uploadedFile)
	if err != nil {
		ctx.JSON(500, gin.H{
			"detail": "Error copying the uploaded file",
		})
		return
	}

	// Return success message
	ctx.JSON(200, gin.H{
		"detail": "File uploaded successfully",
	})
}
