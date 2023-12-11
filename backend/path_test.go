package main

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestPathList(t *testing.T) {
	router := setupRouter()
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/path", nil)
	router.ServeHTTP(w, req)
	assert.Equal(t, 200, w.Code)
	// assert.Equal(t, 200, w.Code)
	// assert.Equal(t, "pong", w.Body.String())
}
