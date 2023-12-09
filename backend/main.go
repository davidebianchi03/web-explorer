package main

import (
	"fmt"
	"web-explorer/backend/api/path"

	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()

	// register views
	path.Routes(router)

	router.Run() // listen and serve on 0.0.0.0:8080
	fmt.Println("Server listening at 0.0.0.0:8080")
}