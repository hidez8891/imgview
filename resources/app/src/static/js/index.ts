import Vue from 'vue';
import Component from 'vue-class-component';

@Component({
    props: ['tag', 'isActive', 'name', 'onClick'],
    template: `
        <td class="file"
            v-bind:class="[tag, {active: isActive}]"
            v-on:click="onClick">
            <span class="icon" v-bind:class="[iconType]">
            </span>
            {{ name }}
        </td>`,
    computed: {
        iconType: function (): string {
            switch (this.tag) {
                case "image":
                    return "image icon-newspaper";
                case "arch":
                    return "arch icon-box";
                case "dir":
                    return "dir icon-folder";
            }
            return "";
        }
    }
})
class FileListItemView extends Vue {
};

@Component({
    props: ['files'],
    components: { FileListItemView },
    template: `
        <table class="table">
            <thead>
                <tr>
                    <th>Name</th>
                </tr>
            </thead>
            <tbody id="files">
                <tr v-for="file in files">
                    <file-list-item-view
                     v-bind:tag="file.info.type"
                     v-bind:isActive="file.isActive"
                     v-bind:name="file.info.name"
                     v-bind:onClick="file.onClick"/>
                    </file-list-item-view>
                </tr>
            </tbody>
        </table>`
})
class FileListView extends Vue {
};

class FileListItem {
    info: FileInfo;
    isActive: boolean;
    onClick: () => void;
};

interface FileInfo {
    name: string;
    path: string;
    url: string;
    type: string;
}

let vm = new Vue({
    el: "#window",
    data: {
        header: "header",
        files: new Array<FileListItem>(),
        currentFileName: "",
        updateScroll: false
    },
    computed: {
        footer: function () {
            return this.currentFileName;
        }
    },
    methods: {
        setFiles: function (files: FileListItem[]) {
            this.files = files;
            this.updateCurrentFileName();
        },
        updateFiles: function (updater: (FileListItem) => boolean) {
            for (let i = 0; i < this.files.length; i++) {
                let v = this.files[i] as FileListItem;
                if (updater(v)) {
                    this.$set(this.files, i, v);
                }
            }
            this.updateCurrentFileName();
        },
        updateCurrentFileName: function () {
            for (let i = 0; i < this.files.length; i++) {
                let v = this.files[i] as FileListItem;
                if (v.isActive) {
                    this.currentFileName = v.info.name;
                    return;
                }
            }
        }
    },
    updated: function () {
        if (this.updateScroll) {
            this.updateScroll = false;
            this.$nextTick(function () {
                scrollActive();
            });
        }
    },
    components: {
        FileListView,
        FileListItemView
    }
});

function scrollActive() {
    let acts = document.getElementsByClassName("active");
    if (acts.length == 0) {
        return
    }
    let act = acts[0];
    act.scrollIntoView();
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
                    this.selectPreviousImage();
                    break;

                case "ArrowDown":
                    ev.preventDefault();
                    this.selectNextImage();
                    break;
            }
            return false;
        });

        // set event listener
        astilectron.onMessage((message: any) => {
            switch (message.name) {
                case "load-image":
                    const path = message.payload as string;
                    this.loadImage(path);
                    return;

                case "set-current-files":
                    const files = message.payload as FileInfo[];
                    this.setCurrentFiles(files);
                    return;
            }
        });
    }

    loadImage(path: string) {
        let img = document.getElementById("image") as HTMLImageElement;
        img.src = path;
    }

    setCurrentFiles(files: FileInfo[]) {
        let img = document.getElementById("image") as HTMLImageElement;
        let current_url = img.src;
        let filelists = new Array<FileListItem>();

        for (let file of files) {
            let e = new FileListItem();
            e.info = file;

            switch (file.type) {
                case "image":
                    e.onClick = () => {
                        vm.updateFiles((f: FileListItem): boolean => {
                            if (f.isActive) {
                                f.isActive = false;
                                return true;
                            } else if (f.info.name === e.info.name) {
                                f.isActive = true;
                                return true;
                            } else {
                                return false;
                            }
                        });
                        img.src = file.url;
                        vm.updateScroll = true;
                    }
                    break;

                case "arch":
                    e.onClick = () => {
                        const message = {
                            name: "open-archive",
                            payload: file.path,
                        };
                        astilectron.sendMessage(message);
                    }
                    break;

                case "dir":
                    e.onClick = () => {
                        const message = {
                            name: "change-directory",
                            payload: file.path,
                        };
                        astilectron.sendMessage(message);
                    }
                    break;
            }

            if (current_url == file.url) {
                e.isActive = true;
            }
            filelists.push(e);
        }

        vm.setFiles(filelists);
        vm.updateScroll = true;
    }

    selectPreviousImage() {
        let acts = document.getElementsByClassName("active");
        if (acts.length == 0) {
            return;
        }
        let act = acts[0];

        let images: HTMLElement[] = Array.prototype.slice.call(
            document.getElementById("files").getElementsByClassName("image"));
        let pre_image: HTMLElement = null;
        for (let e of images) {
            if (e === act) {
                break;
            }
            pre_image = e;
        }

        if (pre_image === null) {
            // use last image
            pre_image = images[images.length - 1];
        } else if (images[images.length - 1] === pre_image) {
            // not found active element
            console.log("Error: Not found active image element");
            return;
        }

        pre_image.click();
    }

    selectNextImage() {
        let acts = document.getElementsByClassName("active");
        if (acts.length == 0) {
            return
        }
        let act = acts[0];

        let images: HTMLElement[] = Array.prototype.slice.call(
            document.getElementById("files").getElementsByClassName("image"));
        let next_image: HTMLElement = null;
        images.reverse();
        for (let e of images) {
            if (e === act) {
                break;
            }
            next_image = e;
        }
        images.reverse();

        if (next_image === null) {
            // use first image
            next_image = images[0];
        } else if (images[0] === next_image) {
            // not found active element
            console.log("Error: Not found active image element");
            return;
        }

        next_image.click();
    }
};

let index = new Index();