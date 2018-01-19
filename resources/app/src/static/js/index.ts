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
            return this.currentFileName;
        }
    },
    watch: {
        currentFileName: function (val) {
            this.currentFileName = val;
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

    let pre = 0;
    if (files[pre].name === vm.currentFileName) {
        pre = files.length - 1;
        vm.currentFileName = files[pre].name;
        return;
    }

    for (; pre + 1 < files.length; pre++) {
        if (files[pre + 1].name === vm.currentFileName) {
            break;
        }
    }
    if (pre === files.length) {
        return;
    }
    vm.currentFileName = files[pre].name;
}

function selectNextImage() {
    let files = vm.files.filter((val) => {
        return val.type === "image";
    });
    if (files.length === 0) {
        return;
    }

    let next = files.length - 1;
    if (files[next].name === vm.currentFileName) {
        next = 0;
        vm.currentFileName = files[next].name;
        return;
    }

    for (; next - 1 >= 0; next--) {
        if (files[next - 1].name === vm.currentFileName) {
            break;
        }
    }
    if (next === 0) {
        return;
    }
    vm.currentFileName = files[next].name;
}


let index = new Index();