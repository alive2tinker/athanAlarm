import { createStore } from "vuex";
import axios from "axios";

export default createStore({
  state: {
    city: "",
    state: "",
    country: "",
    calendar: [],
    currentDate: "",
  },
  getters: {
    getCity(state) {
      return state.city;
    },
    getState(state) {
      return state.state;
    },
    getCountry(state) {
      return state.country;
    },
    getCurrentDate(state) {
      return state.currentDate;
    },
    getNextPrayer(state) {
      let nextPrayer = null;
      if (Object.keys(state.currentDate).length > 0) {
        nextPrayer = state.currentDate.timings.filter(
          (s) => new Date(s.time.replace(" (+03)", "")).getTime() > Date.now()
        )[0];
      }
      return nextPrayer;
    },
  },
  mutations: {
    UPDATE_LOCATION(state, data) {
      state.city = data.address.city;
      state.state = data.address.state;
      state.country = data.address.country;
    },
    UPDATE_PRAYER_TIMES(state, data) {
      state.calendar = [];
      data.forEach((element) => {
        const miTimings = Object.entries(element.timings)
          .map(([key, value]) => ({ name: key, time: value }))
          .filter((s) => {
            const miprayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
            return miprayers.includes(s.name);
          });

        const dObject = { date: element.date, timings: miTimings };
        state.calendar.push(dObject);
      });
      const date = new Date();
      const month = date.getMonth() + 1;
      const dateString = `${
        date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()
      }-${month < 10 ? "0" + month : month}-${date.getFullYear()}`;
      const tmpDate = state.calendar.filter(
        (s) => s.date.gregorian.date == dateString
      )[0];
      state.currentDate = tmpDate;
    },
    UPDATE_CURRENT_DATE(state) {
      const date = new Date();
      const month = date.getMonth() + 1;
      const dateString = `${
        date.getDate()  + 1 < 10 ? `0${date.getDate() + 1}` : date.getDate() + 1
      }-${month < 10 ? "0" + month : month}-${date.getFullYear()}`;
      const tmpDate = state.calendar.filter(
        (s) => s.date.gregorian.date == dateString
      )[0];
      state.currentDate = tmpDate;
    },
  },
  actions: {
    fetchLocationDetails({ commit }, coordinates) {
      return new Promise((resolve, reject) => {
        const config = {
          method: "get",
          maxBodyLength: Infinity,
          url: `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.lat}&lon=${coordinates.long}&zoom=18&addressdetails=8`,
          headers: {
            Accept: "application/json",
            "Accept-Language": "en-US",
          },
        };

        axios(config)
          .then(function (response) {
            commit("UPDATE_LOCATION", response.data);
            resolve(response);
          })
          .catch(function (error) {
            reject(error);
          });
      });
    },
    fetchPrayerTimes({ commit }, location) {
      return new Promise((resolve, reject) => {
        const config = {
          method: "get",
          url: `https://api.aladhan.com/v1/calendar/${new Date().getFullYear()}/${
            new Date().getMonth() + 1
          }?latitude=${location.coords.latitude}&longitude=${
            location.coords.longitude
          }&method=4&iso8601=true`,
          headers: {
            Accept: "application/json",
            "Accept-Language": "ar-SA",
            "Content-Type": "application/json",
          },
        };

        axios
          .request(config)
          .then((response) => {
            commit("UPDATE_PRAYER_TIMES", response.data.data);
            resolve(response);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    updateCurrentDate({ commit }) {
      return new Promise((resolve) => {
        commit("UPDATE_CURRENT_DATE");
        resolve();
      })
    },
  },
  modules: {},
});
