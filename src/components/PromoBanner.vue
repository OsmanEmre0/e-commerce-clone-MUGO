<script setup>
import { ref } from 'vue';
import siteData from '../data/siteData.json';

const promoText = siteData.promoText;
</script>

<template>
  <div class="promo-banner">
    <div class="promo-banner-content">
      <!-- Create two identical spans to create a seamless loop effect -->
      <div class="scrolling-text">
        <span v-for="i in 20" :key="i">{{ promoText }} &nbsp;&nbsp;&nbsp; </span>
      </div>
      <div class="scrolling-text">
        <span v-for="i in 20" :key="i">{{ promoText }} &nbsp;&nbsp;&nbsp; </span>
      </div>
    </div>
  </div>
</template>

<style>
.promo-banner {
  background-color: #ff0000;
  color: white;
  padding: 10px 0;
  text-align: center;
  font-weight: bold;
  overflow: hidden;
  width: 100%;
  z-index: 999;
  margin-top: 0;
  height: 40px;
  display: flex;
  align-items: center;
}

.promo-banner-content {
  display: flex;
  width: 100%;
}

.scrolling-text {
  white-space: nowrap;
  animation: scrollText 30s linear infinite;
  font-size: 14px;
}

@keyframes scrollText {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
}

@media (max-width: 991px) {
  .scrolling-text {
    font-size: 13px;
  }
}

@media (max-width: 768px) {
  .scrolling-text {
    font-size: 12px;
  }
}

@media (max-width: 576px) {
  .scrolling-text {
    font-size: 11px;
  }
}
</style>