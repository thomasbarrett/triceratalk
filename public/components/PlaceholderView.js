export default Vue.component('placeholder-view', {
    props: ['message'],
    template: `
    <div style="display:flex; width: 100%; height: 100%; justify-content: center; align-items: center; color:#eeeeee;">
        <h1>{{ message }}</h1>
    </div>
    `
});