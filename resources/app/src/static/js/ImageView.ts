import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { FileListItem } from './FileListView';

@Component({
    template: `
        <img id="image"
             :src="url" />`
})
export class ImageView extends Vue {
    @Prop()
    files: FileListItem[];

    @Prop()
    currentFileName: string;

    get url(): string {
        for (let file of this.files) {
            if (file.name === this.currentFileName) {
                return file.url;
            }
        }
        return "";
    }
};