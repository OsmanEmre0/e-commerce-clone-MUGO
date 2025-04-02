<script setup>
import { defineProps } from 'vue';
import siteData from '../data/siteData.json';

const props = defineProps({
  banners: {
    type: Array,
    required: true
  }
});
</script>

<template>
  <div class="category-banners">
    <div class="banners-container">
      <a 
        v-for="banner in banners" 
        :key="banner.id" 
        :href="banner.link" 
        class="banner-link"
      >
        <div class="banner-item">
          <img :src="banner.image" :alt="banner.title" class="banner-image">
          <div class="banner-overlay">
            <h2 class="banner-title">{{ banner.title.split(' ')[0] }}<br>{{ banner.title.split(' ')[1] }}</h2>
          </div>
        </div>
      </a>
    </div>
  </div>
</template>

<style>
.category-banners {
  margin: 60px auto;
  padding: 0 50px;
}

.banners-container {
  display: flex;
  gap: 20px;
  width: 100%;
}

.banner-link {
  flex: 1;
  text-decoration: none;
  color: inherit;
  display: block;
}

.banner-item {
  position: relative;
  width: 100%;
  height: 500px;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.banner-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.7) grayscale(1);
  transition: filter 0.3s ease;
}

.banner-item:hover .banner-image {
  filter: brightness(0.6) grayscale(0.8);
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.banner-title {
  font-size: 5rem;
  font-weight: bold;
  color: #ff0000;
  text-align: center;
  line-height: 1;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

/* Responsive styles for tablets */
@media (max-width: 992px) {
  .banner-title {
    font-size: 4rem;
  }
  
  .banner-item {
    height: 400px;
  }
}

/* Responsive styles for mobile */
@media (max-width: 768px) {
  .banners-container {
    flex-direction: column;
  }
  
  .banner-link {
    margin-bottom: 20px;
  }
  
  .banner-item {
    height: 350px;
  }
  
  .banner-title {
    font-size: 3.5rem;
  }
  
  .category-banners {
    padding: 0 30px;
    margin: 40px auto;
  }
}

/* Smaller mobile devices */
@media (max-width: 576px) {
  .banner-item {
    height: 250px;
  }
  
  .banner-title {
    font-size: 2.5rem;
  }
  
  .category-banners {
    padding: 0 20px;
    margin: 30px auto;
  }
}
</style>