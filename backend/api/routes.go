package api

import (
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

	upload := route.Group("/upload")
	upload.POST("/*path", PathUpload)
}
