package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/fs"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestPathList(t *testing.T) {
	/**
	* Test api to get list of children elements of a folder
	 */
	teardownTest, router := setupTest(t)
	defer teardownTest(t)

	// no children elements
	w := httptest.NewRecorder()
	abs_path := getTestFolderAbs()
	request_url := fmt.Sprintf("/path/%s", url.QueryEscape(abs_path))
	req, _ := http.NewRequest("GET", request_url, nil)
	router.ServeHTTP(w, req)
	assert.Equal(t, 200, w.Code)

	var children []Child
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

}

func TestPathCreate(t *testing.T) {
	/**
	* Test api to create new child element
	 */
	teardownTest, router := setupTest(t)
	defer teardownTest(t)

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
}

func TestPathUpdate(t *testing.T) {
	/**
	* Test api to update an element
	 */
	teardownTest, router := setupTest(t)
	defer teardownTest(t)

	abs_path := getTestFolderAbs()
	// update an element that does not exist
	request_body := map[string]interface{}{
		"name":        "test.txt",
		"parent":      abs_path,
		"permissions": "777",
	}

	json_data, err := json.Marshal(request_body)
	if err != nil {
		panic(err)
	}

	w := httptest.NewRecorder()
	request_url := fmt.Sprintf("/path/%s", url.QueryEscape(filepath.Join(abs_path, "this-path-does-not-exist")))
	req, _ := http.NewRequest("PUT", request_url, bytes.NewBuffer(json_data))
	router.ServeHTTP(w, req)
	assert.Equal(t, 404, w.Code)

	// create a file
	file, err := os.Create(filepath.Join(abs_path, "test.txt"))
	if err != nil {
		panic(err)
	}
	defer file.Close()
	os.Chmod(filepath.Join(abs_path, "test.txt"), os.FileMode(0777))

	// update file's filename
	request_body = map[string]interface{}{
		"name":        "test-1234.txt",
		"parent":      abs_path,
		"permissions": "777",
	}

	json_data, err = json.Marshal(request_body)
	if err != nil {
		panic(err)
	}

	w = httptest.NewRecorder()
	request_url = fmt.Sprintf("/path/%s", url.QueryEscape(filepath.Join(abs_path, "test.txt")))
	req, _ = http.NewRequest("PUT", request_url, bytes.NewBuffer(json_data))
	router.ServeHTTP(w, req)

	assert.Equal(t, 200, w.Code)
	_, err = os.Stat(filepath.Join(abs_path, "test-1234.txt"))
	assert.Equal(t, nil, err)

	// update file's permissions
	request_body = map[string]interface{}{
		"name":        "test-1234.txt",
		"parent":      abs_path,
		"permissions": "712",
	}

	json_data, err = json.Marshal(request_body)
	if err != nil {
		panic(err)
	}

	w = httptest.NewRecorder()
	request_url = fmt.Sprintf("/path/%s", url.QueryEscape(filepath.Join(abs_path, "test-1234.txt")))
	req, _ = http.NewRequest("PUT", request_url, bytes.NewBuffer(json_data))
	router.ServeHTTP(w, req)

	assert.Equal(t, 200, w.Code)
	info, err := os.Stat(filepath.Join(abs_path, "test-1234.txt"))
	assert.Equal(t, nil, err)
	assert.Equal(t, "712", strconv.FormatInt(int64(info.Mode().Perm()), 8))

	// create a subdirectory
	err = os.MkdirAll(filepath.Join(abs_path, "subdir"), fs.FileMode(0777))
	if err != nil {
		panic(err)
	}

	// update subfolder's name
	request_body = map[string]interface{}{
		"name":        "test-subdir",
		"parent":      abs_path,
		"permissions": "777",
	}

	json_data, err = json.Marshal(request_body)
	if err != nil {
		panic(err)
	}

	w = httptest.NewRecorder()
	request_url = fmt.Sprintf("/path/%s", url.QueryEscape(filepath.Join(abs_path, "subdir")))
	req, _ = http.NewRequest("PUT", request_url, bytes.NewBuffer(json_data))
	router.ServeHTTP(w, req)

	assert.Equal(t, 200, w.Code)
	info, err = os.Stat(filepath.Join(abs_path, "test-subdir"))
	assert.Equal(t, nil, err)
	assert.Equal(t, true, info.IsDir())
	assert.Equal(t, "777", strconv.FormatInt(int64(info.Mode().Perm()), 8))

	// check that old path does not exists
	_, err = os.Stat(filepath.Join(abs_path, "subdir"))
	assert.Equal(t, true, os.IsNotExist(err))

	// update file's path
	request_body = map[string]interface{}{
		"name":        "test-1234.txt",
		"parent":      filepath.Join(abs_path, "test-subdir"),
		"permissions": "777",
	}

	json_data, err = json.Marshal(request_body)
	if err != nil {
		panic(err)
	}

	w = httptest.NewRecorder()
	request_url = fmt.Sprintf("/path/%s", url.QueryEscape(filepath.Join(abs_path, "test-1234.txt")))
	req, _ = http.NewRequest("PUT", request_url, bytes.NewBuffer(json_data))
	router.ServeHTTP(w, req)

	assert.Equal(t, 200, w.Code)
	info, err = os.Stat(filepath.Join(abs_path, "test-subdir", "test-1234.txt"))
	assert.Equal(t, nil, err)
	assert.Equal(t, false, info.IsDir())
	assert.Equal(t, "777", strconv.FormatInt(int64(info.Mode().Perm()), 8))

	// check that old path does not exists
	_, err = os.Stat(filepath.Join(abs_path, "test-1234.txt"))
	assert.Equal(t, true, os.IsNotExist(err))
}

func TestPathDelete(t *testing.T) {
	/**
	* Test api to delete an element
	 */
	teardownTest, router := setupTest(t)
	defer teardownTest(t)
	abs_path := getTestFolderAbs()

	// delete an element that does not exist
	request_body := map[string]interface{}{
		"name":        "test.txt",
		"parent":      abs_path,
		"permissions": "777",
	}

	json_data, err := json.Marshal(request_body)
	if err != nil {
		panic(err)
	}

	w := httptest.NewRecorder()
	request_url := fmt.Sprintf("/path/%s", url.QueryEscape(filepath.Join(abs_path, "this-path-does-not-exist")))
	req, _ := http.NewRequest("DELETE", request_url, bytes.NewBuffer(json_data))
	router.ServeHTTP(w, req)
	assert.Equal(t, 404, w.Code)

	// create a folder with two files inside
	os.Mkdir(filepath.Join(abs_path, "subdir"), 0777)
	file, err := os.Create(filepath.Join(abs_path, "subdir", "file1.txt"))
	if err != nil {
		panic(err)
	}
	defer file.Close()
	_, err = file.Write([]byte(""))
	if err != nil {
		panic(err)
	}
	file, err = os.Create(filepath.Join(abs_path, "subdir", "file2.txt"))
	if err != nil {
		panic(err)
	}
	defer file.Close()
	_, err = file.Write([]byte(""))
	if err != nil {
		panic(err)
	}

	// delete file1.txt
	request_body = map[string]interface{}{
		"name":        "test.txt",
		"parent":      abs_path,
		"permissions": "777",
	}

	json_data, err = json.Marshal(request_body)
	if err != nil {
		panic(err)
	}

	w = httptest.NewRecorder()
	request_url = fmt.Sprintf("/path/%s", url.QueryEscape(filepath.Join(abs_path, "subdir", "file1.txt")))
	req, _ = http.NewRequest("DELETE", request_url, bytes.NewBuffer(json_data))
	router.ServeHTTP(w, req)
	assert.Equal(t, 200, w.Code)

	// check if the file has been deleted
	_, err = os.Stat(filepath.Join(abs_path, "subdir", "file1.txt"))
	assert.Equal(t, true, os.IsNotExist(err))

	// delete a folder that contains a file
	request_body = map[string]interface{}{
		"name":        "test.txt",
		"parent":      abs_path,
		"permissions": "777",
	}

	json_data, err = json.Marshal(request_body)
	if err != nil {
		panic(err)
	}

	w = httptest.NewRecorder()
	request_url = fmt.Sprintf("/path/%s", url.QueryEscape(filepath.Join(abs_path, "subdir")))
	req, _ = http.NewRequest("DELETE", request_url, bytes.NewBuffer(json_data))
	router.ServeHTTP(w, req)
	assert.Equal(t, 200, w.Code)

	// check if the folder has been deleted
	_, err = os.Stat(filepath.Join(abs_path, "subdir"))
	assert.Equal(t, true, os.IsNotExist(err))
}
