import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { FileListItem } from './FileListView';

@Component({
    template: `
        <div :class="{reverse: !isLeftToRight}">
            <img class="image"
                 :class="{multi: currentFileNameList.length > 1}"
                 v-for="file in imageFiles"
                 :src="file.url" />
        </div>
    `
})
export class ImageView extends Vue {
    @Prop()
    files: FileListItem[];

    @Prop()
    currentFileNameList: string[];

    @Prop()
    isLeftToRight: Boolean

    get imageFiles() {
        return this.files.filter((val) => {
            return this.currentFileNameList.includes(val.name);
        })
    }
};