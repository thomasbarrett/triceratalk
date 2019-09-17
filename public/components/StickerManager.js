import { createSticker, fetchStickers, updateSticker, deleteSticker } from './api.js'

export default Vue.component('sticker-manager', {
    data: function() {
        return {
            files: [],
            stickersLoaded: false,
            stickers: [],
            tags: '',
            selectedSticker: null
        }
    },
    mounted: function() {
        fetchStickers().then(response => {
            this.stickers = response.stickers;
            this.stickersLoaded = true;
        }).catch(error => {
            console.log(error);
        });
    },
    methods: {

        handleFileSelect: function(evt) {
            evt.stopPropagation();
            evt.preventDefault();
            var files = evt.dataTransfer.files; // FileList object.
            for (let i = 0; i < files.length; i++) {
                let file = (files.item(i))
                this.files.push(window.URL.createObjectURL(file))
                createSticker(file);
            }
        },
        
        handleDragOver: function(evt) {
            evt.stopPropagation();
            evt.preventDefault();
            evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
        },

        handleSelectSticker: function(sticker) {
            this.selectedSticker = sticker;
            this.tags = this.selectedSticker.tags ? this.selectedSticker.tags.join(','): '';
        },

        handleDeleteSticker: function() {
            deleteSticker(this.selectedSticker._id);
            this.selectedSticker = null;
        },

        handleUpdateSticker: function() {
            this.selectedSticker.tags = this.tags.split(',');
            updateSticker(this.selectedSticker);
            this.selectedSticker = null;
        },
    },
    template: `
    <div class='sticker-mananger'>
        <h1 style="margin-left: 20px;">Sticker Manager</h1>
        <div class="drop-zone" v-on:dragover="handleDragOver" v-on:drop="handleFileSelect">Drop files here</div>
        <div v-if="selectedSticker != null" style="display: flex; border: 1px solid #aaaaaa; margin: 20px; border-radius: 5px; padding: 20px; box-sizing: border-box;">
            <img width="200" height="auto" v-bind:src="selectedSticker.path"></img>
            <div style="flex-grow: 1;">
                <input type="text" style="width: 100%; margin: 5px;" placeholder="tag1, tag2, tag3..." v-model="tags"></input>
                <div style="display: flex;">
                    <button style="margin: 5px;" @click="handleDeleteSticker">Delete</button>
                    <button style="margin: 5px;" @click="handleUpdateSticker">Update</button>
                </div>
            </div>
        </div>
        <div v-if="stickersLoaded" class="sticker-manager-list">
            <div v-for="sticker in stickers" class="sticker-manager-element" @click="handleSelectSticker(sticker)">
                <img width="100%" height="auto" v-bind:src="sticker.path"></img>
                <p>{{sticker.tags ? sticker.tags.join(','): 'no tags'}}</p>
            </div>
        </div>
    </div>
    `
});

/*
 <div style="flex-grow:1;">
                    <input type="text" placeholder="image name" style="width: 100%; margin: 5px;"></input>
                    <input type="text" placeholder="tag1, tag2, tag3..." style="width: 100%; margin: 5px;"></input>
                    <div style="display: flex; margin: 5px;">
                        <button style="margin: 5px;">Update</button>
                        <button style="margin: 5px;">Delete</button>
                    </div>
                </div>
*/