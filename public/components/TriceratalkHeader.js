export default Vue.component('triceratalk-header', {
    template: `
    <header style="display: flex; justify-content: space-between; padding: 10px; align-items: center;">
        <a href="index.html" style="display:flex; align-items: center; font-size: 1.5em;">
            <span style="margin-left: 10px">Tricera<b>Talk</b></span>
        </a>
        <a href="account.html"><i style="font-size: 1.5em" class="fas fa-user"></i></a>
    </header>
    `
});