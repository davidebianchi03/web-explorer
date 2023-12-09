package path

import (
	"os"
	"path/filepath"
	"time"
)

type Child struct {
	Name              string `json:"name"`
	Absolute_path     string `json:"absolute_path"`
	Parent            string `json:"parent"`
	Is_directory      bool   `json:"is_directory"`
	Permissions       string `json:"permissions"`
	Size              int64  `json:"size"`
	Modification_time string `json:"modification_time"`
}

/**
* Join paths
 */
func JoinPath(elements ...string) string {
	return filepath.Join(elements...)
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
		subpath := filepath.Clean(filepath.Join(_path, file.Name()))
		info, err := os.Stat(subpath)
		if err != nil {
			// internal server error
			panic(err)
		}
		child_obj := Child{
			Name:              info.Name(),
			Absolute_path:     filepath.Clean(filepath.Join(_path, info.Name())),
			Parent:            filepath.Clean(_path),
			Is_directory:      info.IsDir(),
			Permissions:       info.Mode().String(),
			Size:              info.Size(),
			Modification_time: info.ModTime().Format(time.RFC3339),
		}
		children = append(children, child_obj)
	}
	return children
}

/**
* Get single child element of a directory
 */
func GetDirectoryChild(_path string) Child {
	_path = filepath.Clean(_path)
	info, err := os.Stat(_path)
	if err != nil {
		// internal server error
		panic(err)
	}

	child_obj := Child{
		Name:              info.Name(),
		Absolute_path:     filepath.Clean(filepath.Join(_path, info.Name())),
		Parent:            filepath.Clean(_path),
		Is_directory:      info.IsDir(),
		Permissions:       info.Mode().String(),
		Size:              info.Size(),
		Modification_time: info.ModTime().Format(time.RFC3339),
	}

	return child_obj
}
