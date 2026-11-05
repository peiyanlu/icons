import SvgIcon from 'virtual:svg-icons-component/vue'
import { createApp } from 'vue'
import 'virtual:svg-icons-register'
import App from './App.vue'


console.log(SvgIcon)

createApp(App)
  .component('svg-icon', SvgIcon)
  .mount('#app')
