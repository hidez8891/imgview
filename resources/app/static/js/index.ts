declare var astilectron: any;
declare interface File {
    path: string;
}

interface FileInfo {
    name: string;
    path: string;
    url: string;
    type: string;
}

class VueFileList {
    name: string;
    type: string;
    isActive: boolean;
    onClick: () => void;
}

declare class Vue {
    constructor(args: object);
    files: Array<VueFileList>;
    updateFiles(files: Array<VueFileList>);
    updateFile(i: number, v: VueFileList);
};

let vm = new Vue({
    el: "#window",
    data: {
        header: "header",
        footer: "footer",
        files: new Array<VueFileList>()
    },
    methods: {
        updateFiles(files: Array<VueFileList>) {
            this.files = files;
        },
        updateFile(i: number, v: VueFileList) {
            this.$set(this.files, i, v);
        }
    }
});

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
        let filelists = new Array<VueFileList>();

        for (let file of files) {
            let e = new VueFileList();
            e.name = file.name;
            e.type = file.type;

            switch (file.type) {
                case "image":
                    e.onClick = () => {
                        for (let i = 0; i < vm.files.length; i++) {
                            let f = vm.files[i];
                            if (f.isActive) {
                                f.isActive = false;
                            }
                            vm.updateFile(i, f);
                        }
                        e.isActive = true;
                        img.src = file.url;
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

        vm.updateFiles(filelists);
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