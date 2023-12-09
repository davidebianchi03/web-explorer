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
	Permissions       int    `json:"permissions"`
	Size              int64  `json:"size"`
	Modification_time string `json:"modification_time"`
}

/**
* Join paths
 */
func LocalJoinPath(elements ...string) string {
	return filepath.Join(elements...)
}

/**
* Get if path exists
 */
func LocalPathExists(path string) bool {
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return false
	} else {
		return true
	}
}

/**
* Get the list of children elements of directory
 */
func LocalGetDirectoryChildren(_path string) []Child {
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
			Permissions:       int(info.Mode()),
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
func LocalGetDirectoryChild(_path string) Child {
	_path = filepath.Clean(_path)
	info, err := os.Stat(_path)
	if err != nil {
		// internal server error
		panic(err)
	}

	child_obj := Child{
		Name:              info.Name(),
		Absolute_path:     filepath.Clean(filepath.Join(filepath.Dir(_path), info.Name())),
		Parent:            filepath.Clean(filepath.Dir(_path)),
		Is_directory:      info.IsDir(),
		Permissions:       int(info.Mode()),
		Size:              info.Size(),
		Modification_time: info.ModTime().Format(time.RFC3339),
	}

	return child_obj
}

/**
* Create new blank file
 */
func LocalCreateFile(_path string) {
	file, err := os.Create(_path)
	if err != nil {
		panic(err)
	}
	defer file.Close()
	_, err = file.Write([]byte(""))
	if err != nil {
		panic(err)
	}
}

/**
* Create new directory
 */
func LocalCreateDirectory(_path string) {
	err := os.Mkdir(_path, 700)
	if err != nil {
		panic(err)
	}
}

/**
* Set permissions of a path (chmod)
 */
func LocalSetPermissions(_path string, unix_permissions int) {
	err := os.Chmod(_path, os.FileMode(unix_permissions))
	if err != nil {
		panic(err)
	}
}

/**
* Rename a part of the path
 */
func LocalRenamePath(old_path string, new_path string) {
	err := os.Rename(old_path, new_path)
	if err != nil {
		panic(err)
	}
}
