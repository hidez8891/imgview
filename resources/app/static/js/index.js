var Index = /** @class */ (function () {
    function Index() {
        var _this = this;
        document.addEventListener('astilectron-ready', function () {
            _this.setListener();
        });
    }
    Index.prototype.setListener = function () {
        var _this = this;
        // drag & drop event
        document.addEventListener("dragover", function (ev) {
            ev.preventDefault();
            return false;
        });
        document.addEventListener("dragleave", function (ev) {
            ev.preventDefault();
            return false;
        });
        document.addEventListener("drop", function (ev) {
            ev.preventDefault();
            var files = ev.dataTransfer.files;
            if (files.length > 0) {
                var message = {
                    name: "open-file",
                    payload: files.item(0).path,
                };
                astilectron.sendMessage(message);
            }
            return false;
        });
        // key event
        document.addEventListener("keydown", function (ev) {
            switch (ev.key) {
                case "ArrowUp":
                    ev.preventDefault();
                    _this.selectPreviousImage();
                    break;
                case "ArrowDown":
                    ev.preventDefault();
                    _this.selectNextImage();
                    break;
            }
            return false;
        });
        // set event listener
        astilectron.onMessage(function (message) {
            switch (message.name) {
                case "load-image":
                    var path = message.payload;
                    _this.loadImage(path);
                    return;
                case "set-current-files":
                    var files = message.payload;
                    _this.setCurrentFiles(files);
                    return;
            }
        });
    };
    Index.prototype.loadImage = function (path) {
        var img = document.getElementById("image");
        img.src = path;
    };
    Index.prototype.setCurrentFiles = function (files) {
        var div = document.getElementById("files");
        while (div.firstChild) {
            div.removeChild(div.firstChild);
        }
        var img = document.getElementById("image");
        var current_url = img.src;
        var scroll_target;
        var _loop_1 = function (file) {
            var e = document.createElement("td");
            e.className = "file";
            e.innerHTML = "" + file.name;
            e.classList.add(file.type);
            switch (file.type) {
                case "image":
                    e.onclick = function () {
                        var acts = document.getElementsByClassName("active");
                        if (acts) {
                            Array.prototype.forEach.call(acts, function (e) {
                                e.classList.remove("active");
                            });
                        }
                        img.src = file.url;
                        e.classList.add("active");
                        e.scrollIntoView({ block: "center", inline: "center" }); // Not Support ???
                    };
                    break;
                case "arch":
                    e.onclick = function () {
                        var message = {
                            name: "open-archive",
                            payload: file.path,
                        };
                        astilectron.sendMessage(message);
                    };
                    break;
                case "dir":
                    e.onclick = function () {
                        var message = {
                            name: "change-directory",
                            payload: file.path,
                        };
                        astilectron.sendMessage(message);
                    };
                    break;
            }
            if (current_url == file.url) {
                e.classList.add("active");
                scroll_target = e;
            }
            var tr = document.createElement("tr");
            tr.appendChild(e);
            div.appendChild(tr);
        };
        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
            var file = files_1[_i];
            _loop_1(file);
        }
        if (scroll_target) {
            scroll_target.scrollIntoView({ block: "center", inline: "center" }); // Not Support ???
        }
    };
    Index.prototype.selectPreviousImage = function () {
        var acts = document.getElementsByClassName("active");
        if (acts.length == 0) {
            return;
        }
        var act = acts[0];
        var images = Array.prototype.slice.call(document.getElementById("files").getElementsByClassName("image"));
        var pre_image = null;
        for (var _i = 0, images_1 = images; _i < images_1.length; _i++) {
            var e = images_1[_i];
            if (e === act) {
                break;
            }
            pre_image = e;
        }
        if (pre_image === null) {
            // use last image
            pre_image = images[images.length - 1];
        }
        else if (images[images.length - 1] === pre_image) {
            // not found active element
            console.log("Error: Not found active image element");
            return;
        }
        pre_image.click();
    };
    Index.prototype.selectNextImage = function () {
        var acts = document.getElementsByClassName("active");
        if (acts.length == 0) {
            return;
        }
        var act = acts[0];
        var images = Array.prototype.slice.call(document.getElementById("files").getElementsByClassName("image"));
        var next_image = null;
        images.reverse();
        for (var _i = 0, images_2 = images; _i < images_2.length; _i++) {
            var e = images_2[_i];
            if (e === act) {
                break;
            }
            next_image = e;
        }
        images.reverse();
        if (next_image === null) {
            // use first image
            next_image = images[0];
        }
        else if (images[0] === next_image) {
            // not found active element
            console.log("Error: Not found active image element");
            return;
        }
        next_image.click();
    };
    return Index;
}());
;
var index = new Index();
