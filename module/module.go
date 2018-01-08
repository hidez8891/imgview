package module

import (
	"fmt"
	"io"
	"net/http"
	"os"
)

type ImageModule interface {
	WriteResponse(w http.ResponseWriter, path string) error
	WriteResponseFromReader(w http.ResponseWriter, r io.Reader, size int64) error
}

type ArchiveModule interface {
	Open(name string) error
	Close() error
	ReadArchive(vpath string) []os.FileInfo
	ReadFile(name string) (io.ReadCloser, error)
	ReadFileInfo(name string) (os.FileInfo, error)
}

var (
	modimages   = make(map[string]ImageModule, 0)
	modarchives = make(map[string]ArchiveModule, 0)
)

func AddImageModule(exts []string, mod ImageModule) {
	for _, ext := range exts {
		modimages[ext] = mod
	}
}

func AddArchiveModule(exts []string, mod ArchiveModule) {
	for _, ext := range exts {
		modarchives[ext] = mod
	}
}

func GetImageModule(ext string) (ImageModule, error) {
	mod, ok := modimages[ext]
	if !ok {
		return nil, fmt.Errorf("Not found %s module", ext)
	}
	return mod, nil
}

func GetArchiveModule(ext string) (ArchiveModule, error) {
	mod, ok := modarchives[ext]
	if !ok {
		return nil, fmt.Errorf("Not found %s module", ext)
	}
	return mod, nil
}

func SupportImageType() []string {
	exts := make([]string, 0)
	for ext, _ := range modimages {
		exts = append(exts, ext)
	}
	return exts
}

func SupportArchiveType() []string {
	exts := make([]string, 0)
	for ext, _ := range modarchives {
		exts = append(exts, ext)
	}
	return exts
}
