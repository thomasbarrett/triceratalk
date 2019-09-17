import { store } from './store.js'
import { readUsers, addFriends } from './api.js'

export default Vue.component('discover-view', {
    data: function() {
        return {
            user: store.user,
            searchUserQuery: '',
            searchedUsers: []
        }
    },
    methods: {
        addFriend(friend) {
            if (!this.user.friends) {
                this.user.friends = []
            }

            if (!this.user.friends.includes(friend.username)) {
                this.user.friends.push(friend.username);

                // append friend to friends list in database
                addFriends(this.user.username, [friend.username]).then(result => {
                    console.log(result);
                }).catch(error => {
                    console.log(error);
                });
        
                // create a chat with the new friend to create chat element in database
                createChat([this.user.username, friend.username]).then(response => {
                    console.log(response)
                }).catch(error => {
                    console.log(error);
                });
            }
        },
       
    },
    mounted: function () {
        readUsers().then(result => {
            console.log(result);
            this.searchedUsers = result.users;
        }).catch(error => {
            console.log(error);
        });
    },
    template: `
    <div class='discover-view'>
        <h1>Discover</h1>
        <ul>
            <li v-for="user in searchedUsers">
                <span>{{ user.username }}</span>
                <i @click="addFriend(user)" class="fa fa-plus"></i>
            </li>
        </ul>
    </div>
    `
});
