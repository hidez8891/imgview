import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';

@Component({
    template: `
        <div class="btn-group">
            <button class="btn btn-default"
                    :class="{active: isSinglePanel}"
                    @click="setPanelMode(true)">
                <span class="icon icon-doc" />
            </button>
            <button class="btn btn-default"
                    :class="{active: !isSinglePanel}"
                    @click="setPanelMode(false)">
                <span class="icon icon-docs" />
            </button>
        </div>
    `
})
export class ToolbarImagePanelMode extends Vue {
    @Prop()
    isSinglePanel: Boolean

    setPanelMode(isSinglePanel: boolean) {
        this.$emit('update:isSinglePanel', isSinglePanel);
    }
}