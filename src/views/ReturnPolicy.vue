<template>
  <Navbar />
  <transition name="fade" @enter="scrollToTop">
    <div class="return-policy-page">
      <div class="return-policy-container">
        <h1 class="policy-page-title">{{ returnPolicy.title }}</h1>
        
        <div class="policy-content">
          <!-- Main content -->
          <div class="main-content" v-html="returnPolicy.content"></div>
          
          <!-- Campaign returns section -->
          <h2>{{ returnPolicy.campaignReturns.title }}</h2>
          
          <div v-for="(scenario, index) in returnPolicy.campaignReturns.scenarios" :key="index">
            <h3>{{ scenario.title }}</h3>
            <p><strong>{{ scenario.subtitle }}</strong></p>
            <div class="description" v-html="scenario.description"></div>
          </div>
        </div>
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
const returnPolicy = ref(siteData.returnPolicy);
const siteInfo = ref(siteData.siteInfo);

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

<style>
/* Page transition animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.return-policy-page {
  min-height: calc(100vh - 147px);
  background-color: #fff;
  padding: 2rem;
  margin-top: 107px;
}

.return-policy-container {
  max-width: 1200px;
  margin: 0;
  padding: 2rem 4rem;
}

.policy-page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 2rem;
  text-align: center;
  position: static;
  padding-left: 0;
}

.policy-content {
  line-height: 1.8;
  color: #333;
  text-align: left;
  padding-left: 0;
}

.policy-content p {
  margin-bottom: 1.5rem;
  text-align: left;
  padding-left: 0;
}

.policy-content h2 {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 2rem 0 1rem;
  color: #1a1a1a;
  text-align: left;
  padding-left: 0;
}

.policy-content h3 {
  font-size: 1.2rem;
  font-weight: bold;
  margin: 1.5rem 0 1rem;
  color: #1a1a1a;
  text-align: left;
  padding-left: 0;
}

.policy-content a {
  color: #ff0000;
  text-decoration: none;
  transition: color 0.3s ease;
}

.policy-content a:hover {
  color: #cc0000;
}

.main-content {
  margin-bottom: 2rem;
  line-height: 1.8;
  color: #333;
  text-align: left;
}

.description {
  margin-bottom: 1rem;
  line-height: 1.8;
  color: #333;
  text-align: left;
}

@media (max-width: 768px) {
  .return-policy-container {
    padding: 1rem 2rem;
  }
  
  .policy-page-title {
    font-size: 1.75rem;
    padding-left: 0.5rem;
  }
  
  .policy-content {
    padding-left: 0.5rem;
  }
  
  .policy-content p {
    padding-left: 0.5rem;
  }
  
  .policy-content h2 {
    font-size: 1.35rem;
    padding-left: 0.5rem;
  }
  
  .policy-content h3 {
    font-size: 1.1rem;
    padding-left: 0.5rem;
  }
}

@media (max-width: 576px) {
  .return-policy-container {
    padding: 0.5rem 1rem;
  }
  
  .policy-page-title {
    font-size: 1.5rem;
    padding-left: 0.25rem;
  }
  
  .policy-content {
    padding-left: 0.25rem;
  }
  
  .policy-content p {
    padding-left: 0.25rem;
  }
  
  .policy-content h2 {
    font-size: 1.25rem;
    padding-left: 0.25rem;
  }
  
  .policy-content h3 {
    font-size: 1rem;
    padding-left: 0.25rem;
  }
}
</style>