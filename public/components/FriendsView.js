import { store } from './store.js'

export default Vue.component('friends-view', {
    data: function() {
        return {
            store: store,
        }
    },
    template: `
    <div class='friends-view'>
        <h1>Friends</h1>
        <ul v-if="store.userLoaded">
            <li v-for="friend in store.user.friends">
                <span>{{ friend }}</span>
            </li>
        </ul>
    </div>
    `
});