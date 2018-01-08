package main

import (
	"context"
	"flag"
	"fmt"
	"net/http"
	"path/filepath"

	"github.com/asticode/go-astilectron"
	"github.com/asticode/go-astilectron-bootstrap"
	"github.com/asticode/go-astilog"
	"github.com/hidez8891/imgview/module"
	"github.com/pkg/errors"

	_ "github.com/hidez8891/imgview/module/archive"
	_ "github.com/hidez8891/imgview/module/image"
)

// Vars
var (
	AppName string
	BuiltAt string
	debug   = flag.Bool("d", false, "enables the debug mode")
	wnd     *astilectron.Window
	srv     *http.Server
)

func main() {
	// Init
	flag.Parse()
	astilog.FlagInit()

	// bootstrap options
	options := bootstrap.Options{
		Asset: Asset,
		AstilectronOptions: astilectron.Options{
			AppName:            AppName,
			AppIconDarwinPath:  "resources/icon.icns",
			AppIconDefaultPath: "resources/icon.png",
		},
		Debug:       *debug,
		Homepage:    "index.html",
		MenuOptions: []*astilectron.MenuItemOptions{},
		OnWait: func(_ *astilectron.Astilectron, w *astilectron.Window, _ *astilectron.Menu, _ *astilectron.Tray, _ *astilectron.Menu) error {
			wnd = w
			// start http server
			runServer(4340)
			return nil
		},
		MessageHandler: apiEventHandler,
		RestoreAssets:  RestoreAssets,
		WindowOptions: &astilectron.WindowOptions{
			Height: astilectron.PtrInt(700),
			Width:  astilectron.PtrInt(700),
		},
	}

	// Run bootstrap
	astilog.Debugf("Running app built at %s", BuiltAt)
	if err := bootstrap.Run(options); err != nil {
		astilog.Fatal(errors.Wrap(err, "running bootstrap failed"))
	}

	// shutdown http server
	if srv != nil {
		srv.Shutdown(context.Background())
	}
}

func runServer(port int) {
	http.HandleFunc("/image/", imageHandler)
	http.Handle("/", http.NotFoundHandler())

	addr := fmt.Sprintf("localhost:%d", port)
	srv = &http.Server{Addr: addr}
	go func() {
		astilog.Debugf("start web server [port:%d]", addr)
		if err := srv.ListenAndServe(); err != nil {
			if err != http.ErrServerClosed {
				astilog.Fatal(errors.Wrap(err, "crash web server"))
			}
		}
	}()
}

func imageHandler(w http.ResponseWriter, r *http.Request) {
	param := r.URL.Query()
	encPath := param.Get("path")
	if len(encPath) == 0 {
		http.NotFound(w, r)
		return
	}

	paths, err := decodeStringArray(encPath)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	file := paths[len(paths)-1]
	ext := filepath.Ext(file)
	mod, err := module.GetImageModule(ext)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if len(paths) == 1 {
		if err := mod.WriteResponse(w, file); err != nil {
			astilog.Error(err.Error())
		}
	} else {
		arch := paths[0]
		modarch, err := module.GetArchiveModule(filepath.Ext(arch))
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if err := modarch.Open(arch); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer modarch.Close()

		r, err := modarch.ReadFile(file)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer r.Close()

		info, err := modarch.ReadFileInfo(file)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if err := mod.WriteResponseFromReader(w, r, info.Size()); err != nil {
			astilog.Error(err.Error())
		}
	}
}
