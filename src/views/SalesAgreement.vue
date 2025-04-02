<template>
  <Navbar />
  <transition name="fade" @enter="scrollToTop">
    <div class="sales-agreement-page">
      <div class="sales-agreement-container">
        <h1 class="sales-agreement-title">{{ salesAgreement.title }}</h1>
        <div class="sales-agreement-content" v-html="salesAgreement.content"></div>
      </div>
    </div>
  </transition>
  <Footer />
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from '../components/Navbar.vue';
import Footer from '../components/Footer.vue';
import siteData from '../data/siteData.json';

const route = useRoute();
const salesAgreement = ref(siteData.salesAgreement);

const scrollToTop = () => {
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 100);
};

onMounted(() => {
  scrollToTop();
});

watch(() => route.path, () => {
  scrollToTop();
});
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.sales-agreement-page {
  min-height: calc(100vh - 147px);
  background-color: #fff;
  padding: 2rem;
  margin-top: 107px;
}

.sales-agreement-container {
  max-width: 1200px;
  margin: 0;
  padding: 2rem 4rem;
}

.sales-agreement-title {
  font-size: 2rem;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 2rem;
  text-align: center;
  position: static;
  padding-left: 0;
}

.sales-agreement-content {
  line-height: 1.8;
  color: #333;
  text-align: left;
  padding-left: 0;
}

.sales-agreement-content p {
  margin-bottom: 1.5rem;
  text-align: left;
  padding-left: 0;
}

.sales-agreement-content h2 {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 2rem 0 1rem;
  color: #1a1a1a;
  text-align: left;
  padding-left: 0;
}

.sales-agreement-content h3 {
  font-size: 1.2rem;
  font-weight: bold;
  margin: 1.5rem 0 1rem;
  color: #1a1a1a;
  text-align: left;
  padding-left: 0;
}

@media (max-width: 768px) {
  .sales-agreement-container {
    padding: 1rem 2rem;
  }
  
  .sales-agreement-title {
    font-size: 1.75rem;
    padding-left: 0.5rem;
  }
  
  .sales-agreement-content {
    padding-left: 0.5rem;
  }
  
  .sales-agreement-content p {
    padding-left: 0.5rem;
  }
  
  .sales-agreement-content h2 {
    font-size: 1.35rem;
    padding-left: 0.5rem;
  }
  
  .sales-agreement-content h3 {
    font-size: 1.1rem;
    padding-left: 0.5rem;
  }
}

@media (max-width: 576px) {
  .sales-agreement-container {
    padding: 0.5rem 1rem;
  }
  
  .sales-agreement-title {
    font-size: 1.5rem;
    padding-left: 0.25rem;
  }
  
  .sales-agreement-content {
    padding-left: 0.25rem;
  }
  
  .sales-agreement-content p {
    padding-left: 0.25rem;
  }
  
  .sales-agreement-content h2 {
    font-size: 1.25rem;
    padding-left: 0.25rem;
  }
  
  .sales-agreement-content h3 {
    font-size: 1rem;
    padding-left: 0.25rem;
  }
}
</style>