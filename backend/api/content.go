package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

/**
* GET /content/<path>
 */
func PathGetContent(ctx *gin.Context) {
	path := ctx.Param("path")

	if !LocalPathExists(path) {
		ctx.JSON(http.StatusNotFound, gin.H{
			"detail": "Path not found",
		})
		return
	}

	if LocalIsDirectory(path) {
		ctx.JSON(http.StatusNotAcceptable, gin.H{
			"detail": "Selected path is not a file",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"content": LocalReadFile(path),
	})
}

/**
* PUT /content/<path>
 */
func PathPutContent(ctx *gin.Context) {
	type RequestBody struct {
		Content string `json:"content"`
	}

	path := ctx.Param("path")

	if !LocalPathExists(path) {
		ctx.JSON(http.StatusNotFound, gin.H{
			"detail": "Path not found",
		})
		return
	}

	if LocalIsDirectory(path) {
		ctx.JSON(http.StatusNotAcceptable, gin.H{
			"detail": "Selected path is not a file",
		})
		return
	}

	var request_body RequestBody

	if err := ctx.ShouldBindJSON(&request_body); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}

	LocalWriteFile(path, request_body.Content)

	ctx.JSON(http.StatusOK, gin.H{
		"detail": request_body.Content,
	})
}
