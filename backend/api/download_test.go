package api

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestDownload(t *testing.T) {
	/**
	* Test api to download a file
	 */
	teardownTest, router := setupTest(t)
	defer teardownTest(t)

	// download a file that does not exist
	w := httptest.NewRecorder()
	abs_path := getTestFolderAbs()
	request_url := fmt.Sprintf("/download/%s", url.QueryEscape(filepath.Join(abs_path, "not-exists.txt")))
	req, _ := http.NewRequest("GET", request_url, nil)
	router.ServeHTTP(w, req)
	assert.Equal(t, 404, w.Code)

	// create subfolder with inside one file
	os.Mkdir(filepath.Join(abs_path, "subdir"), 0777)
	file, err := os.Create(filepath.Join(abs_path, "subdir", "file1.txt"))
	if err != nil {
		panic(err)
	}
	defer file.Close()
	_, err = file.Write([]byte("Hello world!"))
	if err != nil {
		panic(err)
	}

	// try to download the folder
	w = httptest.NewRecorder()
	abs_path = getTestFolderAbs()
	request_url = fmt.Sprintf("/download/%s", url.QueryEscape(filepath.Join(abs_path, "subdir")))
	req, _ = http.NewRequest("GET", request_url, nil)
	router.ServeHTTP(w, req)
	assert.Equal(t, 200, w.Code)

	// get the content of the file
	w = httptest.NewRecorder()
	abs_path = getTestFolderAbs()
	request_url = fmt.Sprintf("/download/%s", url.QueryEscape(filepath.Join(abs_path, "subdir", "file1.txt")))
	req, _ = http.NewRequest("GET", request_url, nil)
	router.ServeHTTP(w, req)
	assert.Equal(t, 200, w.Code)
}
