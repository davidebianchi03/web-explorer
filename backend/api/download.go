package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

/**
* GET /download/<path>
 */
func PathDownload(ctx *gin.Context) {
	path := ctx.Param("path")

	if !LocalPathExists(path) {
		ctx.JSON(http.StatusNotFound, gin.H{
			"detail": "Path not found",
		})
		return
	}

	if LocalIsDirectory(path) {
		LocalPathTarGzToStream(path, ctx)
	} else {
		LocalWriteFileToStream(path, ctx)
	}
}
