import * as api from "./api.js"

let store = {
    url: 'https://triceratalk.com',
    WSURL: 'wss://triceratalk.com',
    user: null,
    userLoaded: false,
    layout: 'placeholder',
    loadedChats: {},
    currentChat: null,
    callbacks: {},

    stickers: [],
    stickersLoaded: false,

    ws: null,
    wsOpen: false,

    fetchUser() {
        api.whoami().then(result => {
            this.user = result.user;
            this.userLoaded = true;
        }).catch(error => {
            console.log(error);
        });
    },

    createSocket() {
        this.ws = new WebSocket(this.WSURL);
        this.ws.onopen = (event) => {
          this.wsOpen = true;
        };
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data)
            this.publish(data.type, data);
        }
    },

    subscribe(event, callback) {
        let index;

        if (!this.callbacks[event]) {
            this.callbacks[event] = [];
        }
        index = this.callbacks[event].push(callback) - 1;
        return {
            unsubscribe() {
                this.callbacks[event].splice(index, 1);
            }
        };
    },

    send(event, data) {
        this.ws.send(JSON.stringify({
            type: event,
            ...data,
        }));
    },

    publish(event, data) {
        if (!this.callbacks[event]) return;
        this.callbacks[event].forEach(callback => callback(data));
    },

    fetchStickers() {
        api.fetchStickers().then(result => {
            this.stickers = result.stickers;
            this.stickersLoaded = true;
            console.log(this.stickers);
        }).catch(error => {
            console.log(error);
        })
    },

    loadChat(id) {
        if (this.loadedChats[id]) {
            this.currentChat = this.loadedChats[id];
            this.layout = 'chat';
        } else {
            api.loadChat(id).then(result => {
                this.currentChat = this.loadedChats[id];
                if (!result.chat.messages) {
                    result.chat.messages = []
                }
                if (!result.chat.typing) {
                    result.chat.typing = []
                }
                this.loadedChats[id] = result.chat;
                this.currentChat = result.chat;
                this.layout = 'chat';
            }).catch(error => {
                console.log(error);
            });
        }
    },
    
}
  
export { store }
  