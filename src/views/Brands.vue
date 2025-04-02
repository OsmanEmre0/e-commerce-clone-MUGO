<script setup>
import { ref } from 'vue';
import Navbar from '../components/Navbar.vue';
import Footer from '../components/Footer.vue';
import siteData from '../data/siteData.json';

const brands = ref(siteData.brands.items);
</script>

<template>
  <Navbar />
  <div class="brands-page">
    <div class="brands-container">
      <h1 class="brands-title">Markalarımız</h1>
      <div class="brands-grid">
        <a 
          v-for="brand in brands" 
          :key="brand.id" 
          :href="brand.link" 
          class="brand-card"
        >
          <img :src="brand.logo" :alt="brand.name" class="brand-logo">
          <div class="brand-info">
            <h2 class="brand-name">{{ brand.name }}</h2>
            <p class="brand-description">{{ brand.description }}</p>
          </div>
        </a>
      </div>
    </div>
  </div>
  <Footer />
</template>

<style>
.brands-page {
  min-height: calc(100vh - 147px);
  background-color: #fff;
  padding: 2rem;
  margin-top: 107px;
}

.brands-container {
  max-width: 1200px;
  margin: 0 auto;
}

.brands-title {
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
}

.brands-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background-color: #000;
}

.brands-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.brand-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  border: 1px solid #eee;
  border-radius: 16px;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
}

.brand-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.brand-logo {
  width: 200px;
  height: auto;
  margin-bottom: 1.5rem;
  transition: transform 0.3s ease;
  object-fit: contain;
}

.brand-card:hover .brand-logo {
  transform: scale(1.05);
}

.brand-info {
  text-align: center;
}

.brand-name {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.brand-description {
  color: #666;
  line-height: 1.5;
  margin: 0;
}

@media (max-width: 768px) {
  .brands-page {
    padding: 1.5rem;
  }
  
  .brands-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .brands-title {
    font-size: 1.75rem;
    margin-bottom: 2rem;
  }
  
  .brand-logo {
    width: 150px;
  }
  
  .brand-name {
    font-size: 1.25rem;
  }
}

@media (max-width: 576px) {
  .brands-page {
    padding: 1rem;
  }
  
  .brands-title {
    font-size: 1.5rem;
  }
  
  .brand-card {
    padding: 1.5rem;
  }
  
  .brand-logo {
    width: 120px;
  }
}
</style>