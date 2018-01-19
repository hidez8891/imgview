import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { FileListView, FileListItem } from './FileListView';
import { ImageView } from './ImageView';
import { ToolbarImagePanelMode } from './Toolbar';

interface FileInfo {
    name: string;
    path: string;
    url: string;
    type: string;
}

class Index {
    constructor() {
        document.addEventListener('astilectron-ready', () => {
            this.setListener();
        });
    }

    setListener() {
        // drag & drop event
        document.addEventListener("dragover", (ev: DragEvent): boolean => {
            ev.preventDefault();
            return false;
        });
        document.addEventListener("dragleave", (ev: DragEvent): boolean => {
            ev.preventDefault();
            return false;
        });
        document.addEventListener("drop", (ev: DragEvent): boolean => {
            ev.preventDefault();

            const files = ev.dataTransfer.files;
            if (files.length > 0) {
                const message = {
                    name: "open-file",
                    payload: files.item(0).path,
                };
                astilectron.sendMessage(message);
            }
            return false;
        });

        // key event
        document.addEventListener("keydown", (ev: KeyboardEvent): boolean => {
            switch (ev.key) {
                case "ArrowUp":
                    ev.preventDefault();
                    selectPreviousImage();
                    break;

                case "ArrowDown":
                    ev.preventDefault();
                    selectNextImage();
                    break;
            }
            return false;
        });

        // set event listener
        astilectron.onMessage((message: any) => {
            switch (message.name) {
                case "set-current-files":
                    const files = message.payload as FileInfo[];
                    setCurrentFiles(files);
                    return;

                case "set-current-file-path":
                    const path = message.payload as string;
                    setCurrentFileName(path);
                    return;
            }
        });
    }
};

let vm = new Vue({
    el: "#window",
    data: {
        files: new Array<FileListItem>(),
        currentFileName: "",
        isSinglePanel: false
    },
    computed: {
        footer: function () {
            return this.currentFileNameList.join(" / ");
        },
        currentFileNameList: function () {
            let list = [this.currentFileName];
            return appendNextFileNameIfNeed(list, this);
        }
    },
    updated: function () {
        this.$nextTick(function () {
            let actives = document.getElementsByClassName("file active");
            if (actives.length === 0) {
                return;
            }
            actives[0].scrollIntoView();
        });
    },
    components: {
        ToolbarImagePanelMode,
        FileListView,
        ImageView,
    }
});

function setCurrentFileName(path: string) {
    for (let file of vm.files) {
        if (file.path === path) {
            vm.currentFileName = file.name;
            return
        }
    }
}

function setCurrentFiles(infos: FileInfo[]) {
    let files = new Array<FileListItem>();
    for (let info of infos) {
        let e = new FileListItem();
        e.name = info.name;
        e.path = info.path;
        e.url = info.url;
        e.type = info.type;
        files.push(e);
    }
    vm.files = files;
    vm.currentFileName = "";
}

function selectPreviousImage() {
    let files = vm.files.filter((val) => {
        return val.type === "image";
    });
    if (files.length === 0) {
        return;
    }

    let d = 1;
    if (!vm.isSinglePanel && files.length > 2) {
        d = 2;
    }

    let index = files.findIndex((val) => {
        return val.name === vm.currentFileName;
    })
    if (index < 0) {
        return;
    }

    if (index - d < 0) {
        index = files.length - 1 + d;
    }
    vm.currentFileName = files[index - d].name;
}

function selectNextImage() {
    let files = vm.files.filter((val) => {
        return val.type === "image";
    });
    if (files.length === 0) {
        return;
    }

    let d = 1;
    if (!vm.isSinglePanel && files.length > 2) {
        d = 2;
    }

    let index = files.findIndex((val) => {
        return val.name === vm.currentFileName;
    })
    if (index < 0) {
        return;
    }

    if (index + d > files.length - 1) {
        index = 0 - d;
    }
    vm.currentFileName = files[index + d].name;
}

function appendNextFileNameIfNeed(list: string[], v = vm) {
    if (v.isSinglePanel) {
        return list;
    }

    let files = v.files.filter((val) => {
        return val.type === "image";
    });
    if (files.length < 2) {
        return list;
    }

    let index = files.findIndex((val) => {
        return val.name === list[0];
    });
    if (index < 0) {
        return list;
    }

    if (index === files.length - 1) {
        index = 0 - 1;
    }
    return list.concat([files[index + 1].name]);
}


let index = new Index();