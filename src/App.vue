<script setup>
</script>

<template>
  <router-view></router-view>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  overflow-x: hidden;
}

body {
  font-family: 'Inter', sans-serif;
  position: relative;
}

#app {
  width: 100%;
  overflow-x: hidden;
  position: relative;
}

/* Main Slider Section */
.main-section {
  margin-top: 0; /* Adjusted since promo banner is now below navbar */
}

/* Carousel Styles */
.carousel {
  position: relative;
  width: 100%;
  overflow: hidden;
  height: 800px;
  touch-action: pan-y; /* Enable horizontal swiping */
}

.carousel-inner {
  position: relative;
  width: 100%;
  height: 100%;
}

.carousel-item {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.6s ease-in-out;
}

.carousel-item.active {
  opacity: 1;
}

.carousel-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Carousel Controls */
.carousel-controls {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.carousel-control {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  background-color: white;
  border: 1px solid #ddd;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  pointer-events: auto;
  transition: background-color 0.3s;
}

.carousel-control:hover {
  background-color: #f8f8f8;
}

.carousel-control-prev {
  left: 20px;
}

.carousel-control-next {
  right: 20px;
}

.carousel-control-icon {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

/* Carousel Indicators */
.carousel-indicators {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  z-index: 10;
  justify-content: center;
  width: 100%;
  margin-left: 0 !important;
}

.carousel-indicators button {
  width: 30px;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.5);
  border: none;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.carousel-indicators button.active {
  background-color: #fff;
  width: 45px;
}

/* Promo Text */
.carousel-caption {
  position: absolute;
  top: 0;
  right: 0;
  width: 50%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.8);
}

.promo-text {
  color: #ff0000;
  text-align: center;
}

.promo-text h2 {
  font-size: 5rem;
  font-weight: bold;
  line-height: 1;
  margin: 0;
}

.percentage {
  font-size: 8rem;
}

.sepet-indirimi {
  font-size: 4rem;
  margin-top: 10px;
}

/* Mobile Responsive Styles */
@media (max-width: 768px) {
  .carousel {
    height: 400px; /* Reduced height for mobile */
  }
  
  /* Hide carousel controls on mobile */
  .carousel-controls {
    display: none;
  }
  
  /* Hide carousel indicators on mobile */
  .carousel-indicators {
    display: none;
  }
  
  /* Adjust promo text size for mobile */
  .promo-text h2 {
    font-size: 2.5rem;
  }
  
  .percentage {
    font-size: 4rem;
  }
  
  .sepet-indirimi {
    font-size: 2rem;
  }
  
  /* Make carousel caption take full width on mobile */
  .carousel-caption {
    width: 100%;
    right: auto;
  }
}

/* Even smaller screens */
@media (max-width: 576px) {
  .carousel {
    height: 300px; /* Further reduced height for smaller screens */
  }
  
  .promo-text h2 {
    font-size: 2rem;
  }
  
  .percentage {
    font-size: 3rem;
  }
  
  .sepet-indirimi {
    font-size: 1.5rem;
  }
}
</style>