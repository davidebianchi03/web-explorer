package path

import "github.com/gin-gonic/gin"

func Routes(route *gin.Engine) {
	path := route.Group("/path")
	path.GET("/:path", PathList)
	path.GET("/:path/:child", PathRetrieve)
	path.POST("/:path", PathCreate)
	path.PUT("/:path/:child", PathUpdate)
	path.DELETE("/:path/:child", PathDelete)
	path.GET("/:path/:child/content", PathGetContent)
	path.PUT("/:path/:child/content", PathPutContent)
}
