<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup>
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { useI18n } from 'vue-i18n';
 const { locale } = useI18n({ useScope:'global'});
  document.body.setAttribute('dir', locale.value === 'ar' ? 'rtl' :'ltr')
</script>
