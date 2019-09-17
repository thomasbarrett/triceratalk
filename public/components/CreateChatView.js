import { store } from './store.js'
import { createChat } from './api.js'

export default Vue.component('create-chat-view', {
    data: function() {
        return {
            store: store,
            name: '',
            members: [store.user.username],
        }
    },
    methods: {
        toggleMember: function(username) {
            if (!this.members.includes(username)) {
                this.members.push(username);
            } else {
                this.members = this.members.filter(e => e != username);
            }
        },
        createChat: function() {
            createChat(this.name, this.members).then(data => {
                if (!this.store.user.chats) {
                    this.store.user.chats = []
                }
                this.store.user.chats.push(data.chat);
                console.log(store);
            }).catch(error => {
                console.log('error: createChat ' + error.message);
            });
        }
    },
    template: `
    <div class='create-chat-view'>
        <h1>Create Chat</h1>
        <input placeholder="chat name" v-model="name"><br/>
        <ul>
            <li v-for='friend in store.user.friends' @click='toggleMember(friend)'>
                <p v-bind:class="{ active: members.includes(friend) }">{{friend}}</p>
            </li>
        </ul>
        <button @click="createChat">Create</button>
    </div>
    `
});