package controller

import (
	"web-explorer/backend/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	router := gin.Default()

	// use middlewares
	router.Use(middleware.PanicRecoveryMiddleware)

	return router
}
