import { store } from './store.js'

const api = {
  get: function(method) {
    return fetch(`${store.url}/api/${method}`, {
        headers: {
            'Accept': 'application/json',
        },
    }).then(response => {
        if (response.status === 200) {
            return response.json(); 
        } else {
            return Promise.reject({ message: `status code: ${response.status}` });
        }
    }).then(data => {
        if (data.success) {
            return data; 
        } else {
            return Promise.reject({ message: data.message });
        }
    });
  },
  post: function(method, params) {
    return fetch(`${store.url}/api/${method}`, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(params)
    }).then(response => {
        if (response.status === 200) {
            return response.json(); 
        } else {
            return Promise.reject({ message: `status code: ${response.status}` });
        }
    }).then(data => {
        if (data.success) {
            return data; 
        } else {
            return Promise.reject({ message: data.message });
        }
    });
  },
  delete: function(method) {
    return fetch(`${store.url}/api/${method}`, {
        method: 'delete',
        headers: {
            'Accept': 'application/json',
        },
    }).then(response => {
        if (response.status === 200) {
            return response.json(); 
        } else {
            return Promise.reject({ message: `status code: ${response.status}` });
        }
    }).then(data => {
        if (data.success) {
            return data; 
        } else {
            return Promise.reject({ message: data.message });
        }
    });
  }
}

function authenticate(username, password) {
    return api.post('authenticate', {username, password});
}

function createAccount(username, password, email) {
    return api.post('createAccount', {username, password, email});
}

function createChat(name, members) {
    return api.post('chats/', { name, members });
}

function loadChat(_id) {
    return api.get(`chats/${_id}`);
}

function logout() {
    return api.post('logout');
}

function whoami() {
    return api.get('whoami');
}

function everyone() {
    return api.get('everyone');
}

function updateProfile(profile) {
    return api.post('users/profile', profile);
}

function readProfile() {
    return api.get('users/profile');
}

function readUsers() {
    return api.get('users');
}

function addFriends(user, friends) {
    return api.post(`users/${user}/friends`, {friends});
}

function updatePassword(password) {
    return api.post('users/password', password);
}

function fetchStickers() {
    return api.get('stickers');
}

function createSticker(file) {
    let formData = new FormData();
    formData.append('file', file);
    return fetch(`${store.url}/api/stickers`, {
        method: 'post',
        body: formData
    }).then(response => {
        if (response.status === 200) {
        return response.json(); 
        } else {
        return Promise.reject({ message: `status code: ${response.status}` });
        }
    }).then(data => {
        if (data.success) {
        return data; 
        } else {
        return Promise.reject({ message: data.message });
        }
    });
};

function updateSticker() {
}


function deleteSticker(id) {
    return api.delete(`stickers/${id}`);
}

export {authenticate, fetchStickers, createSticker, updateSticker, deleteSticker, createAccount, updatePassword, createChat, loadChat, updateProfile, readProfile, addFriends, readUsers, whoami, logout, everyone };