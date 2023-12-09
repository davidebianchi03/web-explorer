package path

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func PathList(ctx *gin.Context) {
	path := ctx.Param("path")
	if PathExists(path) {
		children_elements := GetDirectoryChildren(path)
		ctx.JSON(http.StatusOK, children_elements)
	} else {
		ctx.JSON(http.StatusNotFound, gin.H{
			"detail": "Path not found",
		})
	}
}
