<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="loader" v-show="loading">
        <semipolar-spinner
          class="m-auto"
          :animation-duration="2000"
          :size="65"
          color="#ff1d5e"
        />
      </div>
      <header-component></header-component>
      <div
        v-show="!loading"
        class="bg-white dark:bg-gray-800 mx-auto shadow-0 w-52 flex h-52 my-4 p-5 text-center rounded-full"
      >
        <div class="m-auto">
          <h1 class="text-2xl font-bold">
            {{ currentDate ? currentDate.date.readable : "-" }}
          </h1>
          <h1 class="text-4xl font-bold">{{ timeLeft }}</h1>
          <h1 class="text-2xl font-bold">
            {{ nextPrayer ? $t(nextPrayer.name ?? "") : "" }}
          </h1>
        </div>
      </div>
      <ion-list
        lines="none"
        v-if="currentDate && currentDate.timings.length > 0"
      >
        <ion-item v-for="(prayer, index) in currentDate.timings" :key="index">
          <div
            class="shadow-0 w-full my-2 dark:bg-gray-700 p-2 mx-2 bg-white rounded-md flex justify-between"
          >
            <div>
              <h3 class="text-base font-semibold">{{ prayer.name }}</h3>
              <h5 class="text-sm text-gray-500 dark:text-gray-200">
                {{
                  new Date(
                    prayer.time.replace(" (+03)", "")
                  ).toLocaleTimeString()
                }}
              </h5>
            </div>
            <div>
              <ion-toggle :checked="false"></ion-toggle>
            </div>
          </div>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { IonContent, IonPage, IonToggle } from "@ionic/vue";
import { SemipolarSpinner } from "epic-spinners";
import HeaderComponent from "@/components/HeaderComponent.vue";
import { ref, computed } from "vue";
import { Geolocation } from "@capacitor/geolocation";
import { useStore } from "vuex";
import moment from "moment";

const loading = ref(true);
const store = useStore();
const timeLeft = ref("00:00:00");
let nextPrayer = null;
let currentDate = null;

const fetchCurrentPosition = async () => {
  const coordinates = await Geolocation.getCurrentPosition();
  return coordinates;
};

fetchCurrentPosition().then((coords) => {
  store.dispatch("fetchLocationDetails", {
    lat: coords.coords.latitude,
    long: coords.coords.longitude,
  });

  store.dispatch("fetchPrayerTimes", coords).then(() => {
    currentDate = computed(() => store.getters["getCurrentDate"]);
    nextPrayer = computed(() => store.getters["getNextPrayer"]);
    if (nextPrayer.value === undefined) {
      store.dispatch("updateCurrentDate").then(() => {
        currentDate = computed(() => store.getters["getCurrentDate"]);
        nextPrayer = computed(() => store.getters["getNextPrayer"]);
      });
    }
    updateTimeLeft();
    loading.value = false;
  });
});

function updateTimeLeft() {
  const interval = 1000;
  setInterval(function () {
    const date = new Date();
    const prayerDate = new Date(nextPrayer.value?.time.replace(" (+03)", ""));
    const diffTime = prayerDate.getTime() - date.getTime();
    let duration = moment.duration(diffTime, "milliseconds");
    duration = moment.duration(duration - interval, "milliseconds");
    timeLeft.value =
      beautifyTime(duration.hours()) +
      ":" +
      beautifyTime(duration.minutes()) +
      ":" +
      beautifyTime(duration.seconds());
  }, interval);
}

function beautifyTime(time) {
  if (time < 10) return `0${time}`;
  return time;
}
</script>

<style scoped>
#container {
  text-align: center;

  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 16px;
  line-height: 22px;

  color: #8c8c8c;

  margin: 0;
}

#container a {
  text-decoration: none;
}
</style>
