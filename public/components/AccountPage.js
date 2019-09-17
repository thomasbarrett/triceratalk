import { readProfile, updateProfile, updatePassword, logout } from './api.js'

export default Vue.component('account-page', {
data: function() {
    return {
        profile: {},
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    }
},
methods: {
    handleDateFieldBlurEvent: function(event) {
        let date = this.birthday.split('/');

        let month = parseInt(date[0]);
        let day = parseInt(date[1]);
        let year = parseInt(date[2]);

        if (month > 0 && month <= 12 && day > 0 && day <= 31 && year >= 0) {
            event.target.classList.remove('invalid');
            event.target.classList.add('valid');
        } else {
            event.target.classList.remove('valid');
            event.target.classList.add('invalid');
        }
    },
    handleConfirmPasswordBlurEvent: function(event) {
        if (this.newPassword === this.confirmPassword) {
            event.target.classList.remove('invalid');
            event.target.classList.add('valid');
        } else {
            event.target.classList.remove('valid');
            event.target.classList.add('invalid');
        }
    },
    handleBlurEvent: function(event) {
        if (event.target.checkValidity()) {
            event.target.classList.remove('invalid');
            event.target.classList.add('valid');
        } else {
            event.target.classList.remove('valid');
            event.target.classList.add('invalid');
        }
    },
    handleUpdateProfile: function(event) {
        updateProfile({
            firstName: this.profile.firstName.toLowerCase().trim(),
            lastName: this.profile.lastName.toLowerCase().trim(),
            email: this.profile.email.toLowerCase().trim(),
            birthday: this.profile.birthday.toLowerCase().trim(),
            gender: this.profile.gender.toLowerCase().trim(),
        }).catch(error => {
            console.log(error);
        });
    },
    handleUpdatePassword: function(event) {
        updatePassword({
            oldPassword: this.oldPassword,
            newPassword: this.newPassword,
        }).catch(error => {
            console.log(error);
        });
    },

    handleLogout: () => logout().then(result => { 
        window.location.reload();
    })
},
mounted: function () {
    readProfile().then(result => {
        this.profile = result.profile;
    }).catch(error => {
        console.log(error);
    })
},
template: `
<div>
    <header style="display: flex; justify-content: space-between; padding: 10px; align-items: center;">
        <a href="index.html" style="display:flex; align-items: center; font-size: 1.5em;">
            <span style="margin-left: 10px">Tricera<b>Talk</b></span>
        </a>
        <a href="account.html"><i style="font-size: 1.5em" class="fas fa-user"></i></a>
    </header>
        
    <div class="stats-container">
        <form style="max-width: 500px; margin: auto; padding: 30px 0;"  >
            <h1>Profile</h1>
            
            <label>First Name</label>
            <input type="text" v-model="profile.firstName" @blur='handleBlurEvent' required>
            <p>Please enter your first name.</p>

            <label>Last Name</label>
            <input type="text" v-model="profile.lastName" @blur='handleBlurEvent' required>
            <p>Please enter your last name.</p>

            <label>Email</label>
            <input type="email" v-model="profile.email" @blur='handleBlurEvent'  required>
            <p>Please enter a valid email address.</p>

            <label>Birthday</label>
            <input type="text" v-model="profile.birthday" @blur='handleDateFieldBlurEvent' placeholder='mm/dd/yyyy' required>
            <p>Please enter a valid date.</p>

            <label>Gender</label>
            <input type="text" v-model="profile.gender" @blur='handleBlurEvent'  required>
            <p>Please enter your gender.</p>

            <button @click.prevent='handleUpdateProfile'>Update</button>
            <button @click.prevent='handleLogout'>Logout</button>

        </form>
    </div>

    <div class="stats-container">
        <form style="max-width: 500px; margin: auto; padding: 30px 0;">
            <h1>Change Password</h1>

            <label>Old Password</label>
            <input type="password" v-model="oldPassword" @blur='handleBlurEvent' required>
            <p>Please enter your old password.</p>

            <label>New Password</label>
            <input type="password" v-model="newPassword" @blur='handleBlurEvent' required>
            <p>Please enter your new password.</p>

            <label>Confirm New Password</label>
            <input type="password" v-model="confirmPassword" @blur='handleConfirmPasswordBlurEvent'  required>
            <p>Please confirm your new password.</p>

            <button @click.prevent='handleUpdatePassword'>Update</button>
        </form>
    </div>
</div>
`
});