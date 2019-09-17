import { store } from './store.js'

const Message = Vue.extend({
    props: {
        message: Object
    },
    computed: {
        
    },
    template: `
    <div class='message' :class='{client: $store.user.username === message.from}'>

    </div>
    `
});

export default Vue.component('chat-view', {
    data: function() {
        return {
            user: store.user,
            store: store,
            now: new Date(),
            showStickers: false,
            text: '',
        }
    },
    created: function () {
        setInterval(() => this.now = new Date(), 1000)
    },
    methods: {
        sendMessage () {
            const message = {
                type: 'text',
                time: new Date(),
                from: this.store.user.username,
                text: this.text,
            };

            let {messages, typing, ...chat} = store.currentChat;

            this.store.send('message', {
                chat: chat,
                message: message,
            });

            this.store.currentChat.messages.push(message);
            this.text = '';
        },
        sendSticker (sticker) {
            const message = {
                type: 'sticker',
                time: new Date(),
                from: this.store.user.username,
                sticker: sticker,
            };

            let {messages, typing, ...chat} = store.currentChat;

            this.store.send('message', {
                chat: chat,
                message: message,
            });

            this.store.currentChat.messages.push(message);
            this.text = '';
        },
        stillTyping () {
            let {messages, typing, ...chat} = store.currentChat;

            this.store.send('typing', {
                chat: chat,
                time: new Date(),
                from: this.store.user.username,
            });
        },
        elapsedTimeString(time) {
            let messageTime = new Date(time);
            let currentTime = new Date();
            let elapsedTime = currentTime - messageTime;
            if (elapsedTime <= 1000 * 120) {
                return 'a minute ago';
            } else if (elapsedTime <= 1000 * 60 * 10) {
                return 'a couple of minutes ago';
            } else if (elapsedTime <= 1000 * 60 * 60 * 24) {
                return messageTime.toLocaleTimeString();
            } else {
                return messageTime.toLocaleDateString();
            }
        },
        toggleStickers() {
           this.showStickers = !this.showStickers; 
        },
    },
    computed: {
        typing: function () {
            return this.store.currentChat.typing.filter(e => {
                return this.now - new Date(e.time) < 10000
            }).length > 0;
        },
        messages: function() {
            let previous = null;
            for (let i = 0; i < store.currentChat.messages.length; i++) {
                let message = store.currentChat.messages[i];
                if (!message.time) {
                    message.displayTimestamp = false;
                } else if (previous === null) {
                    message.displayTimestamp = true;
                } else {
                    let messageDate = new Date(message.time);
                    let previousDate = new Date(previous.time);
                    if (messageDate - previousDate < 60000) {
                        message.displayTimestamp = false;
                    } else {
                        message.displayTimestamp = true;
                    }
                }
                previous = message;
            }
            return store.currentChat.messages.slice().reverse();
        }
    },
    template: `
    <div class='chat-view'>
        <div>
            <h1>{{ store.currentChat.name}}</h1>
        </div>
        <ul>
            <li v-if='typing'>
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </li>
            <li :class='{client: message.from === store.user.username}' v-for='message in messages'>
                <p class='timestamp' v-if='message.displayTimestamp'>{{  elapsedTimeString(message.time) }}</p>
                <span v-if='message.type === "text"'>{{ message.text }}</span>
                <img v-else-if='message.type === "sticker"' v-bind:src='message.sticker.path'></img>
                <span v-else class='error'>Unknown Message Type</span>
            </li>

        </ul>
        <div class='input-container'>
            <div class='split'>
                <button v-on:click='toggleStickers'>Stickers</button>
                <input type='text' v-model='text' @keydown='stillTyping' v-on:keyup.enter="sendMessage"/>
            </div>
            <div class='sticker-container' v-if='showStickers'>
                <img v-for='sticker in store.stickers' @click='sendSticker(sticker)' v-bind:src='sticker.path'/>
            </div>
        </div>
    </div>
    `
});
