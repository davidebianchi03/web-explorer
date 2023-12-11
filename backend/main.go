package main

import (
	"fmt"
	"web-explorer/backend/api/path"

	"github.com/gin-gonic/gin"
)

func setupRouter() *gin.Engine {
	router := gin.Default()

	// use middlewares
	router.Use(panicRecoveryMiddleware)

	// register views
	path.Routes(router)
	return router
}

func main() {
	router := setupRouter()

	router.Run(":8080") // listen and serve on 0.0.0.0:8080
	fmt.Println("Server listening at 0.0.0.0:8080")
}
