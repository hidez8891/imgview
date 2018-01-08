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
        let img = document.getElementById("image-view") as HTMLImageElement;
        img.src = path;
    }

    setCurrentFiles(files: FileInfo[]) {
        let div = document.getElementById("files");
        while (div.firstChild) {
            div.removeChild(div.firstChild);
        }

        let img = document.getElementById("image-view") as HTMLImageElement;
        let current_url = img.src;
        let scroll_target: HTMLElement;

        for (let file of files) {
            let e = document.createElement("li");
            e.className = "file";
            e.innerHTML = `${file.name}`;

            switch (file.type) {
                case "image":
                    e.onclick = () => {
                        let acts = document.getElementsByClassName("active");
                        if (acts) {
                            Array.prototype.forEach.call(acts, function (e: HTMLElement) {
                                e.classList.remove("active");
                            });
                        }
                        img.src = file.url;
                        e.classList.add("active");
                    }
                    break;

                case "arch":
                    e.onclick = () => {
                        const message = {
                            name: "open-archive",
                            payload: file.path,
                        };
                        astilectron.sendMessage(message);
                    }
                    break;

                case "dir":
                    e.onclick = () => {
                        const message = {
                            name: "change-directory",
                            payload: file.path,
                        };
                        astilectron.sendMessage(message);
                    }
                    break;
            }

            if (current_url == file.url) {
                e.classList.add("active");
                scroll_target = e;
            }

            div.appendChild(e);
        }

        if (scroll_target) {
            scroll_target.scrollIntoView();
        }
    }
};

let index = new Index();