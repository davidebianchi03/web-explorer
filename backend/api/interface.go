package api

import (
	"archive/tar"
	"compress/gzip"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

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
			Absolute_path:     strings.ReplaceAll(filepath.Clean(filepath.Join(filepath.Dir(_path), info.Name())), "\\", "/"),
			Parent:            strings.ReplaceAll(filepath.Clean(_path), "\\", "/"),
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
		Absolute_path:     strings.ReplaceAll(filepath.Clean(filepath.Join(filepath.Dir(_path), info.Name())), "\\", "/"),
		Parent:            strings.ReplaceAll(filepath.Clean(filepath.Dir(_path)), "\\", "/"),
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

/**
* Delete file of directory
 */
func LocalDeletePath(path string) {
	err := os.RemoveAll(path)
	if err != nil {
		panic(err)
	}
}

/**
* Get if path is a directory
 */
func LocalIsDirectory(path string) bool {
	info, err := os.Stat(path)
	if err != nil {
		panic(err)
	}

	if info.IsDir() {
		return true
	} else {
		return false
	}
}

/**
* Read the content of a file
 */
func LocalReadFile(path string) string {
	content, err := os.ReadFile(path)
	if err != nil {
		panic(err)
	}

	return string(content)
}

/**
* Write the content of a file
 */
func LocalWriteFile(path string, content string) {
	info, err := os.Stat(path)
	if err != nil {
		// internal server error
		panic(err)
	}
	err = os.WriteFile(path, []byte(content), info.Mode())
	if err != nil {
		// internal server error
		panic(err)
	}
}

/**
* Writes the content of a file into another stream
 */
func LocalWriteFileToStream(path string, context *gin.Context) {
	file, err := os.Open(path)
	if err != nil {
		panic(err)
	}
	defer file.Close()
	_, err = io.Copy(context.Writer, file)
	if err != nil {
		panic(err)
	}
}

/**
* Creates a tar.gz archive of a folder and send it back to a user
 */
func LocalPathTarGzToStream(path string, context *gin.Context) {
	tarGzFile, err := os.CreateTemp("", fmt.Sprintf("%s.tar.gz", filepath.Base(path)))
	if err != nil {
		panic(err)
	}
	defer tarGzFile.Close()

	gw := gzip.NewWriter(tarGzFile)
	defer gw.Close()

	tw := tar.NewWriter(gw)
	defer tw.Close()

	err = filepath.Walk(path, func(filePath string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		relative_path, err := filepath.Rel(path, filePath)
		if err != nil {
			return err
		}

		header, err := tar.FileInfoHeader(info, "")
		if err != nil {
			return err
		}

		header.Name = strings.ReplaceAll(relative_path, "\\", "/")

		if err := tw.WriteHeader(header); err != nil {
			return err
		}

		if !info.IsDir() {
			file, err := os.Open(filePath)
			if err != nil {
				return err
			}
			defer file.Close()

			if _, err := io.Copy(tw, file); err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		panic(err)
	}
	if err := tw.Close(); err != nil {
		panic(err)
	}

	if err := gw.Close(); err != nil {
		panic(err)
	}

	defer os.Remove(tarGzFile.Name())
	context.File(tarGzFile.Name())

	context.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s.tar.gz", filepath.Base(path)))
	context.Header("Content-Type", "application/gzip")
}
