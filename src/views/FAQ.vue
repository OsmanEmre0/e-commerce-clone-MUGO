<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from '../components/Navbar.vue';
import Footer from '../components/Footer.vue';
import siteData from '../data/siteData.json';

const route = useRoute();
const activeSection = ref(null);
const faqSections = ref(siteData.faq.sections);

const toggleQuestion = (sectionId) => {
  if (activeSection.value === sectionId) {
    activeSection.value = null;
  } else {
    activeSection.value = sectionId;
  }
};

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
  <div class="faq-page">
    <div class="faq-container">
      <div class="faq-sections">
        <div v-for="section in faqSections" :key="section.id" class="faq-section">
          <template v-if="section.id === 'info'">
            <div class="info-section">
              <div v-for="(item, index) in section.content" :key="index" class="info-item">
                <p v-if="item.heading" class="info-heading">{{ item.heading }}</p>
                <p v-if="item.text" class="info-text">{{ item.text }}</p>
              </div>
            </div>
          </template>
          <template v-else>
            <h2 class="section-title">{{ section.title }}</h2>
            <div class="questions-list">
              <div v-for="question in section.questions" :key="question.id" class="question-item">
                <button 
                  class="question-button" 
                  @click="toggleQuestion(section.id + question.question)"
                  :class="{ 'active': activeSection === section.id + question.question }"
                >
                  {{ question.question }}
                  <i class="bi" :class="activeSection === section.id + question.question ? 'bi-dash' : 'bi-plus'"></i>
                </button>
                
                <div 
                  class="answer" 
                  :class="{ 'active': activeSection === section.id + question.question }"
                >
                  {{ question.answer }}
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
  <Footer />
</template>

<style>
.faq-page {
  min-height: calc(100vh - 147px);
  background-color: #fff;
  padding: 2rem;
  margin-top: 107px;
}

.faq-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.faq-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.faq-section {
  background: #fff;
  border-radius: 8px;
}

.info-section {
  padding: 2rem 0;
  margin: 2rem 0;
  line-height: 1.6;
}

.info-item {
  margin-bottom: 1rem;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-heading {
  font-weight: bold;
  color: #000;
  margin: 0 0 0.5rem 0;
}

.info-text {
  color: #000;
  margin: 0 0 0.5rem 0;
}

.section-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 1.5rem;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.question-item {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

.question-button {
  width: 100%;
  padding: 1.25rem;
  background: #f8f8f8;
  border: none;
  text-align: left;
  font-size: 1rem;
  font-weight: 500;
  color: #1a1a1a;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
}

.question-button:hover {
  background: #f0f0f0;
}

.question-button.active {
  background: #1a1a1a;
  color: white;
}

.question-button i {
  font-size: 1.25rem;
  transition: transform 0.3s ease;
}

.answer {
  max-height: 0;
  overflow: hidden;
  transition: all 0.3s ease;
  background: white;
  padding: 0 1.25rem;
}

.answer.active {
  max-height: 500px;
  padding: 1.25rem;
}

@media (max-width: 768px) {
  .faq-page {
    padding: 1rem;
  }
  
  .faq-container {
    padding: 1rem;
  }
  
  .section-title {
    font-size: 1.35rem;
  }
  
  .question-button {
    padding: 1rem;
    font-size: 0.95rem;
  }
  
  .answer.active {
    padding: 1rem;
  }
}

@media (max-width: 576px) {
  .faq-page {
    padding: 0.5rem;
  }
  
  .faq-container {
    padding: 0.5rem;
  }
  
  .section-title {
    font-size: 1.25rem;
  }
  
  .question-button {
    padding: 0.875rem;
    font-size: 0.9rem;
  }
  
  .answer.active {
    padding: 0.875rem;
  }
}
</style>