"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var vue_1 = require("vue");
var vue_class_component_1 = require("vue-class-component");
var v = require('vue');
console.log(v);
console.log(vue_1.default);
var FileListView = /** @class */ (function (_super) {
    __extends(FileListView, _super);
    function FileListView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FileListView = __decorate([
        vue_class_component_1.default({
            props: ['files'],
            template: "\n        <tr v-for=\"file in files\">\n            <file-list-item-view v-bind:item=\"file\"/>\n            </file-list-item-view>\n        </tr>"
        })
    ], FileListView);
    return FileListView;
}(vue_1.default));
;
var FileListItemView = /** @class */ (function (_super) {
    __extends(FileListItemView, _super);
    function FileListItemView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FileListItemView = __decorate([
        vue_class_component_1.default({
            props: ['item'],
            template: "\n        <td class=\"file\"\n            v-bind:class=\"[item.info.type, {active: item.isActive}]\"\n            v-on:click=\"item.onClick\">\n            {{ item.info.name }}\n        </td>"
        })
    ], FileListItemView);
    return FileListItemView;
}(vue_1.default));
;
var FileListItem = /** @class */ (function () {
    function FileListItem() {
    }
    return FileListItem;
}());
;
var vm = new vue_1.default({
    el: "#window",
    data: {
        header: "header",
        footer: "footer",
        files: new Array()
    },
    methods: {
        setFiles: function (files) {
            this.files = files;
        },
        updateFiles: function (updater) {
            for (var i = 0; i < this.files.length; i++) {
                var v_1 = this.files[i];
                if (updater(v_1)) {
                    this.$set(this.files, i, v_1);
                }
            }
        }
    },
    components: {
        FileListView: FileListView,
        FileListItemView: FileListItemView
    }
});
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
        var img = document.getElementById("image");
        var current_url = img.src;
        var filelists = new Array();
        var _loop_1 = function (file) {
            var e = new FileListItem();
            e.info = file;
            switch (file.type) {
                case "image":
                    e.onClick = function () {
                        vm.updateFiles(function (f) {
                            if (f.isActive) {
                                f.isActive = false;
                                return true;
                            }
                            else if (f == e) {
                                f.isActive = true;
                                return true;
                            }
                            else {
                                return false;
                            }
                        });
                        img.src = file.url;
                    };
                    break;
                case "arch":
                    e.onClick = function () {
                        var message = {
                            name: "open-archive",
                            payload: file.path,
                        };
                        astilectron.sendMessage(message);
                    };
                    break;
                case "dir":
                    e.onClick = function () {
                        var message = {
                            name: "change-directory",
                            payload: file.path,
                        };
                        astilectron.sendMessage(message);
                    };
                    break;
            }
            if (current_url == file.url) {
                e.isActive = true;
            }
            filelists.push(e);
        };
        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
            var file = files_1[_i];
            _loop_1(file);
        }
        vm.setFiles(filelists);
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
