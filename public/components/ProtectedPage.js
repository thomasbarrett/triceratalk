import { store } from './store.js'
import LoginPage from './LoginPage.js'

export default function protect(content) {
  return {
    computed: {
      displayed: function() {
        return store.user ? content: 'login-page';
      }
    },
    template: '<component :is="displayed"></component>'
  }
}
