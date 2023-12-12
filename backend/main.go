package main

import (
	"fmt"
	"web-explorer/backend/api"
	"web-explorer/backend/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	router := gin.Default()

	// use middlewares
	router.Use(middleware.PanicRecoveryMiddleware)

	// register views
	api.Routes(router)
	return router
}

func main() {
	router := SetupRouter()

	router.Run(":8080") // listen and serve on 0.0.0.0:8080
	fmt.Println("Server listening at 0.0.0.0:8080")
}
