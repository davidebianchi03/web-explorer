package test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"path"
	"path/filepath"
	"strconv"
	"strings"
	"testing"
	"web-explorer/backend/api"
	"web-explorer/backend/controller"

	"github.com/stretchr/testify/assert"
)

func getTestFolderAbs() string {
	working_dir, err := os.Getwd()
	if err != nil {
		panic(err)
	}

	testing_dir := path.Join(working_dir, "test-tmp")
	testing_dir = strings.ReplaceAll(testing_dir, "\\", "/")

	return testing_dir
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

	os.MkdirAll(testing_dir, os.ModePerm)
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

func TestPathList(t *testing.T) {
	/**
	* Test api to get list of children elements of a folder
	 */
	testTmpFolderSetup()
	router := controller.SetupRouter()

	// no children elements
	w := httptest.NewRecorder()
	abs_path := getTestFolderAbs()
	request_url := fmt.Sprintf("/path/%s", url.QueryEscape(abs_path))
	req, _ := http.NewRequest("GET", request_url, nil)
	router.ServeHTTP(w, req)
	assert.Equal(t, 200, w.Code)

	var children []api.Child
	err := json.Unmarshal(w.Body.Bytes(), &children)
	if err != nil {
		panic(err)
	}
	assert.Equal(t, len(children), 0)

	// try to create a child element and repeat the test
	file, err := os.Create(filepath.Join(abs_path, "test.txt"))
	if err != nil {
		panic(err)
	}
	defer file.Close()
	os.Chmod(filepath.Join(abs_path, "test.txt"), os.FileMode(0777))

	// try again to request children elements
	w = httptest.NewRecorder()
	abs_path = getTestFolderAbs()
	request_url = fmt.Sprintf("/path/%s", url.QueryEscape(abs_path))
	req, _ = http.NewRequest("GET", request_url, nil)
	router.ServeHTTP(w, req)
	assert.Equal(t, 200, w.Code)

	err = json.Unmarshal(w.Body.Bytes(), &children)
	if err != nil {
		panic(err)
	}
	assert.Equal(t, len(children), 1)

	child := children[0]
	assert.Equal(t, child.Absolute_path, filepath.Join(abs_path, "test.txt"))
	assert.Equal(t, child.Is_directory, false)
	assert.Equal(t, child.Name, "test.txt")
	assert.Equal(t, child.Parent, abs_path)
	assert.Equal(t, child.Size, int64(0))
	assert.Equal(t, child.Permissions, "777")

	// try to get children elements of a folder that doesn't exist
	w = httptest.NewRecorder()
	abs_path = getTestFolderAbs()
	request_url = fmt.Sprintf("/path/%s", url.QueryEscape(filepath.Join(abs_path, "this-path-does-not-exist")))
	req, _ = http.NewRequest("GET", request_url, nil)
	router.ServeHTTP(w, req)
	assert.Equal(t, 404, w.Code)

	// try to get children elements of a path that is not a folder
	w = httptest.NewRecorder()
	abs_path = getTestFolderAbs()
	request_url = fmt.Sprintf("/path/%s", url.QueryEscape(filepath.Join(abs_path, "test.txt")))
	req, _ = http.NewRequest("GET", request_url, nil)
	router.ServeHTTP(w, req)
	assert.Equal(t, 406, w.Code)

	testTmpFolderCleanup()
}

func TestPathCreate(t *testing.T) {
	/**
	* Test api to get list of children elements of a folder
	 */
	testTmpFolderSetup()
	router := controller.SetupRouter()

	// try to create file with parent folder that does not exist
	request_body := map[string]interface{}{
		"name":         "test-1234.txt",
		"is_directory": false,
		"permissions":  "712",
	}

	json_data, err := json.Marshal(request_body)
	if err != nil {
		panic(err)
	}

	w := httptest.NewRecorder()
	abs_path := getTestFolderAbs()
	request_url := fmt.Sprintf("/path/%s", filepath.Join(url.QueryEscape(abs_path), "this-path-does-not-exist"))
	req, _ := http.NewRequest("POST", request_url, bytes.NewBuffer(json_data))
	router.ServeHTTP(w, req)
	assert.Equal(t, 404, w.Code)

	// try to create file
	request_body = map[string]interface{}{
		"name":         "test-1234.txt",
		"is_directory": false,
		"permissions":  "712",
	}

	json_data, err = json.Marshal(request_body)
	if err != nil {
		panic(err)
	}

	w = httptest.NewRecorder()
	abs_path = getTestFolderAbs()
	request_url = fmt.Sprintf("/path/%s", url.QueryEscape(abs_path))
	req, _ = http.NewRequest("POST", request_url, bytes.NewBuffer(json_data))
	router.ServeHTTP(w, req)
	assert.Equal(t, 201, w.Code)

	info, err := os.Stat(filepath.Join(abs_path, "test-1234.txt"))
	assert.Equal(t, nil, err)
	assert.Equal(t, false, info.IsDir())
	assert.Equal(t, int64(0), info.Size())
	assert.Equal(t, "test-1234.txt", info.Name())
	assert.Equal(t, "712", strconv.FormatInt(int64(info.Mode().Perm()), 8))

	// try again to create the same file
	request_body = map[string]interface{}{
		"name":         "test-1234.txt",
		"is_directory": false,
		"permissions":  "712",
	}

	json_data, err = json.Marshal(request_body)
	if err != nil {
		panic(err)
	}

	w = httptest.NewRecorder()
	abs_path = getTestFolderAbs()
	request_url = fmt.Sprintf("/path/%s", url.QueryEscape(abs_path))
	req, _ = http.NewRequest("POST", request_url, bytes.NewBuffer(json_data))
	router.ServeHTTP(w, req)
	assert.Equal(t, 409, w.Code)

	// try to create folder
	request_body = map[string]interface{}{
		"name":         "folder-test",
		"is_directory": true,
		"permissions":  "714",
	}

	json_data, err = json.Marshal(request_body)
	if err != nil {
		panic(err)
	}

	w = httptest.NewRecorder()
	abs_path = getTestFolderAbs()
	request_url = fmt.Sprintf("/path/%s", url.QueryEscape(abs_path))
	req, _ = http.NewRequest("POST", request_url, bytes.NewBuffer(json_data))
	router.ServeHTTP(w, req)
	assert.Equal(t, 201, w.Code)

	info, err = os.Stat(filepath.Join(abs_path, "folder-test"))
	assert.Equal(t, nil, err)
	assert.Equal(t, true, info.IsDir())
	assert.Equal(t, "folder-test", info.Name())
	assert.Equal(t, "714", strconv.FormatInt(int64(info.Mode().Perm()), 8))

	// try to create folder with the same name of the file
	request_body = map[string]interface{}{
		"name":         "test-1234.txt",
		"is_directory": true,
		"permissions":  "714",
	}

	json_data, err = json.Marshal(request_body)
	if err != nil {
		panic(err)
	}

	w = httptest.NewRecorder()
	abs_path = getTestFolderAbs()
	request_url = fmt.Sprintf("/path/%s", url.QueryEscape(abs_path))
	req, _ = http.NewRequest("POST", request_url, bytes.NewBuffer(json_data))
	router.ServeHTTP(w, req)
	assert.Equal(t, 409, w.Code)

	testTmpFolderCleanup()
}
