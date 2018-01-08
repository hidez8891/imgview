package archive

import (
	"archive/zip"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"time"

	"github.com/hidez8891/imgview/module"
)

func init() {
	module.AddArchiveModule([]string{".zip"}, &ArchiveZipModule{nil})
}

type ArchiveZipModule struct {
	arch *zip.ReadCloser
}

func (o *ArchiveZipModule) Open(name string) (err error) {
	if o.arch != nil {
		o.Close()
	}
	o.arch, err = zip.OpenReader(name)
	return
}

func (o *ArchiveZipModule) Close() (err error) {
	if o.arch != nil {
		err = o.arch.Close()
		o.arch = nil
	}
	return
}

func (o *ArchiveZipModule) ReadArchive(vpath string) []os.FileInfo {
	if o.arch == nil {
		return nil
	}

	if vpath == "" {
		vpath = "."
	}

	vmap := make(map[string][]os.FileInfo, 0)
	for _, zipFile := range o.arch.File {
		parentDir := filepath.Dir(filepath.Clean(zipFile.Name))

		if _, ok := vmap[parentDir]; !ok {
			vmap[parentDir] = make([]os.FileInfo, 0)
		}
		files := vmap[parentDir]
		files = append(files, &ZipFileInfo{
			header: zipFile.FileHeader,
		})
		vmap[parentDir] = files
	}

	if files, ok := vmap[vpath]; ok {
		return files
	}
	return []os.FileInfo{}
}

func (o *ArchiveZipModule) ReadFile(name string) (io.ReadCloser, error) {
	if o.arch == nil {
		return nil, fmt.Errorf("archive file is closed")
	}

	for _, zipFile := range o.arch.File {
		if zipFile.FileHeader.Name == name {
			return zipFile.Open()
		}
	}
	return nil, fmt.Errorf("file is not found [%s]", name)
}

func (o *ArchiveZipModule) ReadFileInfo(name string) (os.FileInfo, error) {
	if o.arch == nil {
		return nil, fmt.Errorf("archive file is closed")
	}

	for _, zipFile := range o.arch.File {
		if zipFile.Name == name {
			return &ZipFileInfo{
				header: zipFile.FileHeader,
			}, nil
		}
	}
	return nil, fmt.Errorf("file is not found [%s]", name)
}

type ZipFileInfo struct {
	header zip.FileHeader
}

func (o *ZipFileInfo) Name() string {
	return filepath.Base(filepath.Clean(o.header.Name))
}

func (o *ZipFileInfo) Size() int64 {
	return int64(o.header.UncompressedSize)
}

func (o *ZipFileInfo) Mode() os.FileMode {
	return o.header.Mode()
}

func (o *ZipFileInfo) ModTime() time.Time {
	return o.header.ModTime()
}

func (o *ZipFileInfo) IsDir() bool {
	name := o.header.Name
	return name[len(name)-1] == '/'
}

func (o *ZipFileInfo) Sys() interface{} {
	return nil
}
