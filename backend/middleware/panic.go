package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func PanicRecoveryMiddleware(c *gin.Context) {
	defer func() {
		if err := recover(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"detail": err})
		}
	}()

	c.Next()
}
