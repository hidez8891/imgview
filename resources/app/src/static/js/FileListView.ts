import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';

@Component({
    template: `
        <td class="file"
            :class="[type, {active: isActive}]"
            @click="$emit('click')">
            <span class="icon"
                  :class="[iconType]" />
            {{ name }}
        </td>`
})
class FileListItemView extends Vue {
    @Prop()
    type: string

    @Prop()
    name: string

    @Prop()
    isActive: boolean

    get iconType(): string {
        switch (this.type) {
            case "image":
                return this.type + " icon-newspaper";
            case "arch":
                return this.type + " icon-box";
            case "dir":
                return this.type + " icon-folder";
            default:
                return this.type;
        }
    }
};

@Component({
    components: { FileListItemView },
    template: `
        <table class="table">
            <thead>
                <tr>
                    <th>Name</th>
                </tr>
            </thead>
            <tbody id="files">
                <tr v-for="file in files"
                    :key="file.name">
                    <file-list-item-view :type="file.type"
                                         :name="file.name"
                                         :isActive="file.name === currentFileName"
                                         @click="onClick(file)">
                    </file-list-item-view>
                </tr>
            </tbody>
        </table>`
})
export class FileListView extends Vue {
    @Prop()
    files: FileListItem[];

    @Prop()
    currentFileName: string;

    onClick(file: FileListItem) {
        switch (file.type) {
            case "image":
                this.$emit('update:currentFileName', file.name);
                return;
            case "arch":
                astilectron.sendMessage({
                    name: "open-archive",
                    payload: file.path,
                });
                return;
            case "dir":
                astilectron.sendMessage({
                    name: "change-directory",
                    payload: file.path,
                });
            default:
                return;
        }
    }
};

export class FileListItem {
    name: string;
    path: string;
    url: string;
    type: string;
};