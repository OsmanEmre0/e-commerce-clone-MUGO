<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from '../components/Navbar.vue';
import Footer from '../components/Footer.vue';
import siteData from '../data/siteData.json';

const route = useRoute();
const preInfo = ref(siteData.preInfo);

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

onMounted(() => {
  scrollToTop();
});

watch(() => route.path, () => {
  scrollToTop();
});
</script>

<template>
  <Navbar />
  <transition name="fade" @enter="scrollToTop">
    <div class="pre-info-page">
      <div class="pre-info-container">
        <h1 class="preInfo-page-title">{{ preInfo.title }}</h1>
        <div class="pre-info-content" v-html="preInfo.content"></div>
      </div>
    </div>
  </transition>
  <Footer />
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.pre-info-page {
  min-height: calc(100vh - 147px);
  background-color: #fff;
  padding: 2rem;
  margin-top: 107px;
}

.pre-info-container {
  max-width: 1200px;
  margin: 0;
  padding: 2rem 4rem;
}

.preInfo-page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 2rem;
  text-align: center;
}

.pre-info-content {
  line-height: 1.8;
  color: #333;
  text-align: left;
  max-width: 100%;
}

@media (max-width: 768px) {
  .pre-info-container {
    padding: 1rem 2rem;
  }
  
  .preInfo-page-title {
    font-size: 1.75rem;
  }
}

@media (max-width: 576px) {
  .pre-info-container {
    padding: 0.5rem 1rem;
  }
  
  .preInfo-page-title {
    font-size: 1.5rem;
  }
}
</style>