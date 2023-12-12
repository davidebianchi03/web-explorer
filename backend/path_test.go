package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"path"
	"strings"
	"testing"
	"web-explorer/backend/api"

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

	os.MkdirAll(testing_dir, 777)
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

	// no children elements
	w := httptest.NewRecorder()
	fmt.Println(fmt.Sprintf("/path/%s", url.QueryEscape(getTestFolderAbs())))
	request_url := fmt.Sprintf("/path/%s", url.QueryEscape(getTestFolderAbs()))
	req, _ := http.NewRequest("GET", request_url, nil)
	router.ServeHTTP(w, req)
	assert.Equal(t, 200, w.Code)

	var children []api.Child
	err := json.Unmarshal(w.Body.Bytes(), &children)
	if err != nil {
		panic(err)
	}
	assert.Equal(t, len(children), 0)

	// // try to create a child element and repeat the test
	// filepath := path.Join(getTestFolderAbs(), "test.txt")
	// file, err := os.Create(filepath)
	// if err != nil {
	// 	panic(err)
	// }
	// defer file.Close()
	// _, err = file.Write([]byte(""))
	// if err != nil {
	// 	panic(err)
	// }

	// w = httptest.NewRecorder()
	// fmt.Println(fmt.Sprintf("/path/%s", url.QueryEscape(getTestFolderAbs())))
	// request_url = fmt.Sprintf("/path/%s", url.QueryEscape(getTestFolderAbs()))
	// req, _ = http.NewRequest("GET", request_url, nil)
	// router.ServeHTTP(w, req)
	// assert.Equal(t, 200, w.Code)

	// err = json.Unmarshal(w.Body.Bytes(), &children)
	// if err != nil {
	// 	panic(err)
	// }
	// assert.Equal(t, len(children), 1)

	testTmpFolderCleanup()
}
