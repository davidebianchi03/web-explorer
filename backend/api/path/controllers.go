package path

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

/**
* GET /path/<path>
 */
func PathList(ctx *gin.Context) {
	path := ctx.Param("path")
	if LocalPathExists(path) {
		ctx.JSON(http.StatusOK, LocalGetDirectoryChildren(path))
	} else {
		ctx.JSON(http.StatusNotFound, gin.H{
			"detail": "Path not found",
		})
		return
	}
}

/**
* GET /path/<path>/<child>
 */
func PathRetrieve(ctx *gin.Context) {
	path := ctx.Param("path")
	child := ctx.Param("child")
	if LocalPathExists(LocalJoinPath(path, child)) {
		ctx.JSON(http.StatusOK, LocalGetDirectoryChild(LocalJoinPath(path, child)))
	} else {
		ctx.JSON(http.StatusNotFound, gin.H{
			"detail": "Path not found",
		})
		return
	}
}

/**
* POST /path/<path>
 */
func PathCreate(ctx *gin.Context) {

	type RequestBody struct {
		Name         string `json:"name"`
		Is_directory bool   `json:"is_directory"`
		Permissions  int    `json:"permissions"`
	}

	path := ctx.Param("path")

	if !LocalPathExists(path) {
		ctx.JSON(http.StatusNotFound, gin.H{
			"detail": "Path not found",
		})
		return
	}

	var request_body RequestBody

	if err := ctx.ShouldBindJSON(&request_body); err != nil {
		ctx.JSON(400, gin.H{"detail": err.Error()})
		return
	}

	if LocalPathExists(LocalJoinPath(path, request_body.Name)) {
		ctx.JSON(http.StatusConflict, gin.H{"detail": "Path alredy exists"})
		return
	}

	if request_body.Is_directory {
		LocalCreateDirectory(LocalJoinPath(path, request_body.Name))
	} else {
		LocalCreateFile(LocalJoinPath(path, request_body.Name))
	}

	LocalSetPermissions(LocalJoinPath(path, request_body.Name), request_body.Permissions)
	ctx.JSON(http.StatusCreated, LocalGetDirectoryChild(LocalJoinPath(path, request_body.Name)))
}
