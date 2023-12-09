package path

import (
	"os"
	"path/filepath"
)

type Child struct {
	Name          string `json:"name"`
	Absolute_path string `json:"absolute_path"`
	Parent        string `json:"parent"`
	Is_directory  bool   `json:"is_directory"`
}

/**
* Get if path exists
 */
func PathExists(path string) bool {
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return false
	} else {
		return true
	}
}

/**
* Get the list of children elements of directory
 */
func GetDirectoryChildren(_path string) []Child {
	_path = filepath.Clean(_path)
	dir, err := os.Open(_path)
	if err != nil {
		// internal server error
		panic(err)
	}
	defer dir.Close()
	files, err := dir.ReadDir(0)
	if err != nil {
		// internal server error
		panic(err)
	}
	children := []Child{}
	for _, file := range files {
		child_obj := Child{
			Name:          file.Name(),
			Absolute_path: filepath.Clean(filepath.Join(_path, file.Name())),
			Parent:        filepath.Clean(_path),
			Is_directory:  file.IsDir(),
		}
		children = append(children, child_obj)
	}
	return children
}
