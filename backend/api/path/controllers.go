package path

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func PathList(ctx *gin.Context) {
	path := ctx.Param("path")
	if PathExists(path) {
		ctx.JSON(http.StatusOK, GetDirectoryChildren(path))
	} else {
		ctx.JSON(http.StatusNotFound, gin.H{
			"detail": "Path not found",
		})
	}
}

func PathRetrieve(ctx *gin.Context) {
	path := ctx.Param("path")
	child := ctx.Param("child")
	if PathExists(JoinPath(path, child)) {
		ctx.JSON(http.StatusOK, GetDirectoryChild(JoinPath(path, child)))
	} else {
		ctx.JSON(http.StatusNotFound, gin.H{
			"detail": "Path not found",
		})
	}
}
