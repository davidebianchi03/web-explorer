package main

import (
	"fmt"
	"web-explorer/backend/api"
	"web-explorer/backend/middleware"

	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()

	// use middlewares
	router.Use(middleware.PanicRecoveryMiddleware)
	router.Use(middleware.CORSMiddleware)
	// register views
	api.Routes(router)

	router.Run(":8080") // listen and serve on 0.0.0.0:8080
	fmt.Println("Server listening at 0.0.0.0:8080")
}
