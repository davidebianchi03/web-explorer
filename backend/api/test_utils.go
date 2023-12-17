package api

import (
	"os"
	"path"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
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

func setupTest(tb testing.TB) (func(tb testing.TB), *gin.Engine) {
	// create dir for tests
	testing_dir := getTestFolderAbs()
	_, err := os.Stat(testing_dir)

	if err == nil {
		os.RemoveAll(testing_dir)
	} else {
		if !os.IsNotExist(err) {
			panic(err)
		}
	}

	os.MkdirAll(testing_dir, 0777)

	// setup router
	test_router := gin.Default()
	Routes(test_router)

	return teardownTest, test_router
}

func teardownTest(tb testing.TB) {
	// remove testing folder
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
