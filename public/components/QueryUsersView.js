import { readUsers } from './api.js'

export default Vue.component('query-users-view', {
    props: ['action'],
    data: function() {
        return {
            searchUserQuery: '',
            searchedUsers: []
        }
    },
    methods: {
        searchUsers(query) {
            // search for the top ten users found with given query
            readUsers().then(result => {
                this.searchedUsers = result.users
            }).catch(error => {
              console.log(error);
            });
        },
    },
    template: `
    <div style="padding: 10px 0; box-sizing: border-box;">
        <div class="input-container">
            <input type="text" placeholder="find by username" @keypress.enter="searchUsers(searchUserQuery)" v-model="searchUserQuery" />
        </div>
        <ul class="find-friends-list">
            <li v-for="user in searchedUsers"><span>{{ user.username }}</span>
            <span><button @click="$emit('action', user)">{{ action }}</button></span></li>
        </ul>
    </div>
    `
});
