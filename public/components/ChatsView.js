import { store } from './store.js'

export default Vue.component('chats-view', {
    data: function() {
        return {
            store,
            user: store.user,
        }
    },
    template: `
    <div class="chats-view">
        <div class="split">
            <h1>Chats</h1>
            <i class="fa fa-plus fa-lg" @click="store.layout = 'create'"></i>
        </div>
        <ul>
            <li class='split' @click='store.loadChat(chat._id)' v-for="chat in user.chats">
                <span><b>{{ chat.name }}</b></span>
                <i class="fas fa-comment"></i>
            </li>
        </ul>
    </div>
    `
});