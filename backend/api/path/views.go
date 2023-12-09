package path

import "github.com/gin-gonic/gin"

func Routes(route *gin.Engine) {
	path := route.Group("/path")
	path.GET("/:path", PathList)
	path.GET("/:path/:child", PathRetrieve)
}
