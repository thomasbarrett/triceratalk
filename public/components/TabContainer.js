export default Vue.component('tab-container', {
    props: {
        tabs: Array,
    },
    data: function() {
        return {
            currentTab: this.tabs[0].element,
            tabContainerHeaderStyle: {
                display: 'flex',
            }
        }
    },
    methods: {
        foo: function() {
            console.log('hello');
        }
    },
    template: `
    <div class="tab-container">
        <div class="tab-container-header">
            <span v-bind:class="{ active: currentTab === tab.element }" v-for="tab in tabs" :key="tab.title" @click="currentTab = tab.element" >
                {{ tab.name }}
            </span>
        </div>
        <component :is="currentTab"></component>
    </div>
    `
});