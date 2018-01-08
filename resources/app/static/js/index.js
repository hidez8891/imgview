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
        var img = document.getElementById("image-view");
        img.src = path;
    };
    Index.prototype.setCurrentFiles = function (files) {
        var div = document.getElementById("files");
        while (div.firstChild) {
            div.removeChild(div.firstChild);
        }
        var img = document.getElementById("image-view");
        var current_url = img.src;
        var scroll_target;
        var _loop_1 = function (file) {
            var e = document.createElement("li");
            e.className = "file";
            e.innerHTML = "" + file.name;
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
            div.appendChild(e);
        };
        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
            var file = files_1[_i];
            _loop_1(file);
        }
        if (scroll_target) {
            scroll_target.scrollIntoView();
        }
    };
    return Index;
}());
;
var index = new Index();
