package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func Routes(route *gin.Engine) {
	path := route.Group("/path")
	path.GET("/*path", PathList)
	path.POST("/*path", PathCreate)
	path.PUT("/*path", PathUpdate)
	path.DELETE("/*path", PathDelete)

	content := route.Group("/content")
	content.GET("/*path", PathGetContent)
	content.PUT("/*path", PathPutContent)

	download := route.Group("/download")
	download.GET("/*path", PathDownload)
}

/**
* GET /path/<path>
 */
func PathList(ctx *gin.Context) {
	path := ctx.Param("path")

	if LocalPathExists(path) {
		if LocalIsDirectory(path) {
			ctx.JSON(http.StatusOK, LocalGetDirectoryChildren(path))
		} else {
			ctx.JSON(http.StatusNotAcceptable, gin.H{
				"detail": "Selected path is not a folder",
			})
			return
		}
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
		ctx.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
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

/**
* PUT /path/<path>/<child>
 */
func PathUpdate(ctx *gin.Context) {
	type RequestBody struct {
		Name        string `json:"name"`
		Parent      string `json:"parent"`
		Permissions int    `json:"permissions"`
	}

	path := ctx.Param("path")
	child := ctx.Param("child")

	if !LocalPathExists(LocalJoinPath(path, child)) {
		ctx.JSON(http.StatusNotFound, gin.H{
			"detail": "Path not found",
		})
		return
	}

	var request_body RequestBody

	if err := ctx.ShouldBindJSON(&request_body); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}

	if request_body.Name == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"detail": "Missing parameter 'name'"})
		return
	}

	if request_body.Parent == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"detail": "Missing parameter 'parent'"})
		return
	}

	if LocalPathExists(LocalJoinPath(request_body.Parent, request_body.Name)) {
		ctx.JSON(http.StatusConflict, gin.H{"detail": "New Path alredy exits"})
		return
	}

	LocalRenamePath(LocalJoinPath(path, child), LocalJoinPath(request_body.Parent, request_body.Name))
	LocalSetPermissions(LocalJoinPath(request_body.Parent, request_body.Name), request_body.Permissions)
	ctx.JSON(http.StatusOK, LocalGetDirectoryChild(LocalJoinPath(request_body.Parent, request_body.Name)))

	return
}

/**
* DELETE /path/<path>/<child>
 */
func PathDelete(ctx *gin.Context) {
	path := ctx.Param("path")

	if !LocalPathExists(path) {
		ctx.JSON(http.StatusNotFound, gin.H{
			"detail": "Path not found",
		})
		return
	}
	LocalDeletePath(path)
	ctx.JSON(http.StatusOK, gin.H{
		"detail": "Path has been successfully deleted",
	})
}

/**
* GET /path/<path>/<child>/content
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
	return
}

/**
* PUT /path/<path>/<child>/content
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
	return
}

/**
* GET /path/<path>/<child>/download
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
