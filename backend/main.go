package main

import (
	"fmt"
	"web-explorer/backend/api"
	"web-explorer/backend/controller"
)

func main() {
	router := controller.SetupRouter()
	// register views
	api.Routes(router)

	router.Run(":8080") // listen and serve on 0.0.0.0:8080
	fmt.Println("Server listening at 0.0.0.0:8080")
}
