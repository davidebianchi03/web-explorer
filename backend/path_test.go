package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"path"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
)

func getTestFolderAbs() string {
	working_dir, err := os.Getwd()
	if err != nil {
		panic(err)
	}

	testing_dir := path.Join(working_dir, "test-tmp")

	return strings.ReplaceAll(testing_dir, "\\", "/")
}

func testTmpFolderSetup() {

	testing_dir := getTestFolderAbs()
	_, err := os.Stat(testing_dir)

	if err == nil {
		os.RemoveAll(testing_dir)
	} else {
		if !os.IsNotExist(err) {
			panic(err)
		}
	}

	os.Mkdir(testing_dir, 777)
}

func testTmpFolderCleanup() {

	testing_dir := getTestFolderAbs()
	_, err := os.Stat(testing_dir)

	if err == nil {
		os.RemoveAll(testing_dir)
	} else {
		if !os.IsNotExist(err) {
			panic(err)
		}
	}
}

func TestPathListEmpty(t *testing.T) {
	testTmpFolderSetup()
	router := SetupRouter()

	w := httptest.NewRecorder()
	request_url := fmt.Sprintf("/path/%s", url.PathEscape(getTestFolderAbs()))
	req, _ := http.NewRequest("GET", request_url, nil)
	router.ServeHTTP(w, req)
	assert.Equal(t, 200, w.Code)
	// assert.Equal(t, 200, w.Code)
	// assert.Equal(t, "pong", w.Body.String())

	testTmpFolderCleanup()
}
