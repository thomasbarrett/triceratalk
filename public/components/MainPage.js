import { store } from './store.js'

import TriceratalkHeader from './TriceratalkHeader.js'
import PlaceholderView from './PlaceholderView.js'
import TabContainer from './TabContainer.js'
import FriendsView from './FriendsView.js'
import DiscoverView from './DiscoverView.js'
import ChatsView from './ChatsView.js'
import CreateChatView from './CreateChatView.js'
import ChatView from './ChatView.js'

export default Vue.component('main-page', {
    data: function() {
        return {
            store: store,
            onMessage: null,
            onTyping: null,
            tabs: [{
                name: 'Friends',
                element: "friends-view",
            },{
                name: 'Chats',
                element: "chats-view",
            }, {
                name: 'Discover',
                element: "discover-view",
            }],
        }
    },
    methods: {
        notify: function (title, options) {
            // Let's check if the browser supports notifications
            if (!("Notification" in window)) {
              alert("This browser does not support system notifications");
              // This is not how you would really do things if they aren't supported. :)
            }
          
            // Let's check whether notification permissions have already been granted
            else if (Notification.permission === "granted") {
              // If it's okay let's create a notification
              var notification = new Notification(title, options);
            }
          
            // Otherwise, we need to ask the user for permission
            else if (Notification.permission !== 'denied') {
              Notification.requestPermission(function (permission) {
                // If the user accepts, let's create a notification
                if (permission === "granted") {
                  var notification = new Notification(title, options);
                }
              });
            }
          
            // Finally, if the user has denied notifications and you 
            // want to be respectful there is no need to bother them any more.
          }
    },
    mounted: function() {
        this.store.fetchUser();
        this.store.createSocket();
        this.store.fetchStickers();
        this.onMessage = store.subscribe('message', data => {
            this.notify('Incoming Message', {
                body: `${data.message.from}: ${data.message.text}`
            });
            this.store.loadedChats[data.chat._id].messages.push(data.message);
            this.store.loadedChats[data.chat._id].typing = this.store.loadedChats[data.chat._id].typing.filter(e => {
                return e.from !== data.message.from;
            });
        });
        this.onTyping = store.subscribe('typing', data => {
            this.store.loadedChats[data.chat._id].typing.push({from: data.from, time: data.time});
        });
    },
    destroyed: function() {
        this.onMessage.unsubscribe();
        this.onTyping.unsubscribe();
    },
    template: `
    <div class='main-page'>
        <triceratalk-header class='main-page-header'/>
        <tab-container class='main-page-left' v-bind:tabs='tabs' />
        <placeholder-view v-if='store.layout === "placeholder"' class='main-page-right' message='select a chat'/>
        <create-chat-view v-else-if='store.layout === "create"' class='main-page-right' />
        <chat-view v-else-if='store.layout === "chat"' class='main-page-right' />
    </div>`
});