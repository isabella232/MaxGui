import Vue from "vue";
import axios from "axios";
import VueAxios from "vue-axios";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import router from "./router";
Vue.config.productionTip = false;

// const apiClient = axios.create({
//   baseURL: process.env.VUE_APP_API,
//   headers: {
//     "Content-Type": "application/json"
//   }
// });

Vue.use(VueAxios, axios);

new Vue({
  vuetify,
  router,
  render: h => h(App)
}).$mount("#app");
