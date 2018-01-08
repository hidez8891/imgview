package image

import (
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/hidez8891/imgview/module"
)

func init() {
	types := []struct {
		exts []string
		mime string
	}{
		{[]string{".bmp"}, "image/bmp"},
		{[]string{".gif"}, "image/gif"},
		{[]string{".jpg", ".jpeg"}, "image/jpeg"},
		{[]string{".png"}, "image/png"},
	}

	for _, t := range types {
		module.AddImageModule(t.exts, &ImageBasicModule{t.mime})
	}
}

type ImageBasicModule struct {
	mime string
}

func (o *ImageBasicModule) WriteResponse(w http.ResponseWriter, path string) error {
	file, err := os.Open(path)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return err
	}
	defer file.Close()

	stat, err := file.Stat()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return err
	}
	return o.WriteResponseFromReader(w, file, stat.Size())
}

func (o *ImageBasicModule) WriteResponseFromReader(w http.ResponseWriter, r io.Reader, size int64) error {
	w.Header().Set("Content-Type", o.mime)
	w.Header().Set("Content-Length", fmt.Sprintf("%d", size))
	if _, err := io.Copy(w, r); err != nil {
		return err
	}
	return nil
}
