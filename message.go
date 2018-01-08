package main

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"path/filepath"
	"sort"
	"strings"
	"os"

	"github.com/asticode/go-astilectron"
	"github.com/asticode/go-astilectron-bootstrap"
	"github.com/hidez8891/golib/slice"
	"github.com/hidez8891/imgview/module"
)

type fileInfo struct {
	Name string `json:"name"`
	Path string `json:"path"`
	URL  string `json:"url"`
	Type string `json:"type"`
}

func apiEventHandler(w *astilectron.Window, m bootstrap.MessageIn) (payload interface{}, err error) {
	switch m.Name {
	case "open-file":
		var path string
		if len(m.Payload) == 0 {
			payload = "API want open file path"
			return
		}
		if err = json.Unmarshal(m.Payload, &path); err != nil {
			payload = err.Error()
			return
		}

		if err = openImageFile(w, path); err != nil {
			payload = err.Error()
			return
		}

		dir := filepath.Dir(path)
		if err = setCurrentFiles(w, dir); err != nil {
			payload = err.Error()
			return
		}
		return

	case "open-archive":
		if len(m.Payload) == 0 {
			payload = "API want open archive file path"
			return
		}

		var encPath string
		if err = json.Unmarshal(m.Payload, &encPath); err != nil {
			payload = err.Error()
			return
		}

		var paths []string
		paths, err = decodeStringArray(encPath)
		if err != nil {
			payload = err.Error()
			return
		}

		if len(paths) == 1 {
			if err = openArchiveFile(w, paths[0]); err != nil {
				payload = err.Error()
				return
			}
		} else {
			// archive file
		}
		return

	case "change-directory":
		if len(m.Payload) == 0 {
			payload = "API want change directory path"
			return
		}

		var encPath string
		if err = json.Unmarshal(m.Payload, &encPath); err != nil {
			payload = err.Error()
			return
		}

		var paths []string
		paths, err = decodeStringArray(encPath)
		if err != nil {
			payload = err.Error()
			return
		}

		if len(paths) == 1 {
			var stat os.FileInfo
			if stat, err = os.Stat(paths[0]); err != nil {
				payload = err.Error()
				return
			}

			if stat.IsDir() {
				if err = setCurrentFiles(w, paths[0]); err != nil {
					payload = err.Error()
					return
				}
			} else {
				if err = openArchiveFile(w, paths[0]); err != nil {
					payload = err.Error()
					return
				}
			}
		} else {
			if err = openArchiveFile(w, paths...); err != nil {
				payload = err.Error()
				return
			}
		}
		return
	}
	return
}

func openImageFile(w *astilectron.Window, path string) (err error) {
	ext := filepath.Ext(path)
	exts := module.SupportImageType()
	if slice.Includes(exts, ext) == false {
		return fmt.Errorf("not support file type %s", ext)
	}

	var url string
	if url, err = imageURL(path); err != nil {
		return err
	}

	var encURL []byte
	if encURL, err = json.Marshal(url); err != nil {
		return err
	}

	ret := bootstrap.MessageIn{
		Name:    "load-image",
		Payload: encURL,
	}
	return w.SendMessage(ret)
}

func openArchiveFile(w *astilectron.Window, paths ...string) error {
	if len(paths) == 0 {
		return fmt.Errorf("want archive path")
	}

	ext := filepath.Ext(paths[0])
	mod, err := module.GetArchiveModule(ext)
	if err != nil {
		return fmt.Errorf("not support archive file type %s", ext)
	}

	if err = mod.Open(paths[0]); err != nil {
		return err
	}
	defer mod.Close()

	vpath := strings.Join(paths[1:], "/")
	infos := mod.ReadArchive(vpath)
	sort.Slice(infos, func(i, j int) bool {
		same := infos[i].IsDir() == infos[j].IsDir()
		if same {
			return strings.Compare(
				strings.ToLower(infos[i].Name()),
				strings.ToLower(infos[j].Name())) < 0
		}
		return infos[i].IsDir()
	})

	parentPaths := make([]string, 0)
	if len(paths) == 1 {
		parentPaths = append(parentPaths, filepath.Dir(paths[0]))
	} else {
		parentPaths = append(parentPaths, paths[0])
		vpath := strings.Join(paths[1:len(paths)-1], "/")
		if len(vpath) > 0 {
			parentPaths = append(parentPaths, vpath)
		}
	}
	fmt.Println(parentPaths)
	parentDir, err := encodeStringArray(parentPaths...)
	if err != nil {
		return err
	}
	files := []fileInfo{
		fileInfo{
			Name: "..",
			Path: parentDir,
			URL:  "",
			Type: "dir",
		},
	}

	exts := module.SupportImageType()
	for _, info := range infos {
		name := info.Name()
		url := ""
		typ := "dir"

		// TODO: support inner archive path
		fullpaths := []string{paths[0], name}
		if len(paths) > 1 {
			fullpaths[1] = strings.Join(paths[1:], "/") + "/" + name
		}

		if info.IsDir() == false {
			ext := filepath.Ext(name)
			if slice.Includes(exts, ext) == false {
				continue
			}

			typ = "image"
			if url, err = imageURL(fullpaths...); err != nil {
				return err
			}
		}

		encPath, err := encodeStringArray(fullpaths...)
		if err != nil {
			return err
		}

		files = append(files, fileInfo{
			Name: name,
			Path: encPath,
			URL:  url,
			Type: typ,
		})
	}

	packFiles, err := json.Marshal(files)
	if err != nil {
		return err
	}
	ret := bootstrap.MessageIn{
		Name:    "set-current-files",
		Payload: packFiles,
	}
	return w.SendMessage(ret)
}

func setCurrentFiles(w *astilectron.Window, dir string) error {
	infos, err := ioutil.ReadDir(dir)
	if err != nil {
		return err
	}

	sort.Slice(infos, func(i, j int) bool {
		same := infos[i].IsDir() == infos[j].IsDir()
		if same {
			return strings.Compare(
				strings.ToLower(infos[i].Name()),
				strings.ToLower(infos[j].Name())) < 0
		}
		return infos[i].IsDir()
	})

	imgexts := module.SupportImageType()
	archexts := module.SupportArchiveType()

	parentDir, err := encodeStringArray(filepath.Dir(dir))
	if err != nil {
		return err
	}
	files := []fileInfo{
		fileInfo{
			Name: "..",
			Path: parentDir,
			URL:  "",
			Type: "dir",
		},
	}

	for _, info := range infos {
		name := info.Name()
		path := filepath.Join(dir, name)
		url := ""
		typ := "dir"

		if info.IsDir() == false {
			ext := filepath.Ext(name)
			if slice.Includes(imgexts, ext) {
				typ = "image"
				if url, err = imageURL(path); err != nil {
					return err
				}
			} else if slice.Includes(archexts, ext) {
				typ = "arch"
			} else {
				continue
			}
		}

		path, err = encodeStringArray(path)
		if err != nil {
			return err
		}

		files = append(files, fileInfo{
			Name: name,
			Path: path,
			URL:  url,
			Type: typ,
		})
	}

	packFiles, err := json.Marshal(files)
	if err != nil {
		return err
	}
	ret := bootstrap.MessageIn{
		Name:    "set-current-files",
		Payload: packFiles,
	}
	return w.SendMessage(ret)
}

func encodeStringArray(args ...string) (string, error) {
	packArgs, err := json.Marshal(args)
	if err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(packArgs), nil
}

func decodeStringArray(encArgs string) ([]string, error) {
	packArgs, err := base64.URLEncoding.DecodeString(encArgs)
	if err != nil {
		return nil, err
	}

	var args []string
	if err = json.Unmarshal(packArgs, &args); err != nil {
		return nil, err
	}
	return args, nil
}

func imageURL(path ...string) (string, error) {
	encPath, err := encodeStringArray(path...)
	if err != nil {
		return "", err
	}

	url := "http://localhost:4340/image/?path=" + encPath
	return url, nil
}
