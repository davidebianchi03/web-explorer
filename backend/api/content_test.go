package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestContentGetContent(t *testing.T) {
	/**
	* Test api to get the content of a file
	 */
	teardownTest, router := setupTest(t)
	defer teardownTest(t)

	// get content of a file that does not exist
	w := httptest.NewRecorder()
	abs_path := getTestFolderAbs()
	request_url := fmt.Sprintf("/content/%s", url.QueryEscape(filepath.Join(abs_path, "not-exists.txt")))
	req, _ := http.NewRequest("GET", request_url, nil)
	router.ServeHTTP(w, req)
	assert.Equal(t, 404, w.Code)

	// create a file and a subfolder
	os.Mkdir(filepath.Join(abs_path, "subdir"), 0777)
	file, err := os.Create(filepath.Join(abs_path, "file1.txt"))
	if err != nil {
		panic(err)
	}
	defer file.Close()
	_, err = file.Write([]byte("Hello world!"))
	if err != nil {
		panic(err)
	}

	// try to get the content of the folder (should fail)
	w = httptest.NewRecorder()
	abs_path = getTestFolderAbs()
	request_url = fmt.Sprintf("/content/%s", url.QueryEscape(filepath.Join(abs_path, "subdir")))
	req, _ = http.NewRequest("GET", request_url, nil)
	router.ServeHTTP(w, req)
	assert.Equal(t, 406, w.Code)

	// get the content of the file
	w = httptest.NewRecorder()
	abs_path = getTestFolderAbs()
	request_url = fmt.Sprintf("/content/%s", url.QueryEscape(filepath.Join(abs_path, "file1.txt")))
	req, _ = http.NewRequest("GET", request_url, nil)
	router.ServeHTTP(w, req)
	assert.Equal(t, 200, w.Code)

	var resp_json map[string]interface{}
	err = json.Unmarshal(w.Body.Bytes(), &resp_json)
	if err != nil {
		panic(err)
	}

	assert.Equal(t, "Hello world!", resp_json["content"])
}

func TestContentUpdateContent(t *testing.T) {
	/**
	* Test api to update the content of a file
	 */
	teardownTest, router := setupTest(t)
	defer teardownTest(t)

	// update content of a file that does not exist
	request_body := map[string]interface{}{
		"content": "Hello universe!",
	}

	json_data, err := json.Marshal(request_body)
	if err != nil {
		panic(err)
	}
	w := httptest.NewRecorder()
	abs_path := getTestFolderAbs()
	request_url := fmt.Sprintf("/content/%s", url.QueryEscape(filepath.Join(abs_path, "not-exists.txt")))
	req, _ := http.NewRequest("PUT", request_url, bytes.NewBuffer(json_data))
	router.ServeHTTP(w, req)
	assert.Equal(t, 404, w.Code)

	// create a file and a subfolder
	os.Mkdir(filepath.Join(abs_path, "subdir"), 0777)
	file, err := os.Create(filepath.Join(abs_path, "file1.txt"))
	if err != nil {
		panic(err)
	}
	defer file.Close()
	_, err = file.Write([]byte("Hello world!"))
	if err != nil {
		panic(err)
	}

	// try to update the content of a folder (it should fail)
	request_body = map[string]interface{}{
		"content": "Hello universe!",
	}

	json_data, err = json.Marshal(request_body)
	if err != nil {
		panic(err)
	}
	w = httptest.NewRecorder()
	abs_path = getTestFolderAbs()
	request_url = fmt.Sprintf("/content/%s", url.QueryEscape(filepath.Join(abs_path, "subdir")))
	req, _ = http.NewRequest("PUT", request_url, bytes.NewBuffer(json_data))
	router.ServeHTTP(w, req)
	assert.Equal(t, 406, w.Code)

	// update the content of a file
	request_body = map[string]interface{}{
		"content": "Hello universe!",
	}

	json_data, err = json.Marshal(request_body)
	if err != nil {
		panic(err)
	}
	w = httptest.NewRecorder()
	abs_path = getTestFolderAbs()
	request_url = fmt.Sprintf("/content/%s", url.QueryEscape(filepath.Join(abs_path, "file1.txt")))
	req, _ = http.NewRequest("PUT", request_url, bytes.NewBuffer(json_data))
	router.ServeHTTP(w, req)
	assert.Equal(t, 200, w.Code)

	// check if the content has been updated
	content, err := os.ReadFile(filepath.Join(abs_path, "file1.txt"))
	if err != nil {
		panic(err)
	}
	assert.Equal(t, "Hello universe!", string(content))
}
