<script setup>
import { ref, onMounted } from 'vue';
import Navbar from '../components/Navbar.vue';
import Footer from '../components/Footer.vue';
import siteData from '../data/siteData.json';

const contactInfo = siteData.siteInfo.contactInfo;
const contactMarquee = siteData.contactMarquee;

const form = ref({
  name: '',
  email: '',
  message: '',
  phone: ''
});

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

const handleSubmit = () => {
  // Form gönderme işlemi burada yapılacak
  console.log('Form submitted:', form.value);
  alert('Mesajınız başarıyla gönderildi!');
  form.value = {
    name: '',
    email: '',
    message: '',
    phone: ''
  };
};
</script>

<template>
  <Navbar />
  
  <div class="contact-page">
    <div class="contact-page-container">
      <!-- Store Info Section -->
      <div class="store-info">
        <h1>{{ contactInfo.address.title }}</h1>
        <p class="address">
          {{ contactInfo.address.street }}, {{ contactInfo.address.district }}, {{ contactInfo.address.city }}
        </p>
        <div class="contact-details">
          <p class="work-hours">{{ contactInfo.address.workHours }}</p>
          <p class="phone">{{ contactInfo.address.phone }}</p>
          <p class="email">{{ contactInfo.address.email }}</p>
        </div>
      </div>

      <!-- Contact Marquee -->
      <div class="contact-marquee">
        <div class="marquee-content">
          <div class="marquee-items">
            <span v-for="(text, index) in contactMarquee" :key="index">{{ text }}</span>
          </div>
          <div class="marquee-items">
            <span v-for="(text, index) in contactMarquee" :key="index">{{ text }}</span>
          </div>
        </div>
      </div>

      <!-- Contact Form Section -->
      <div class="contact-form-container">
        <h2>İletişim</h2>
        <form @submit.prevent="handleSubmit" class="contact-form">
          <div class="form-group">
            <label>Ad Soyad</label>
            <input 
              type="text" 
              v-model="form.name"
              required
              placeholder="Adınızı ve soyadınızı giriniz"
            >
          </div>

          <div class="form-group">
            <label>Email</label>
            <input 
              type="email" 
              v-model="form.email"
              required
              placeholder="Email adresinizi giriniz"
            >
          </div>

          <div class="form-group">
            <label>Telefon</label>
            <div class="contact-phone-input">
              <span class="country-code">+90</span>
              <input 
                type="tel"
                v-model="form.phone"
                required
                placeholder="5XX XXX XX XX"
                pattern="[0-9]{10}"
                maxlength="10"
              >
            </div>
          </div>

          <div class="form-group">
            <label>Mesaj</label>
            <textarea 
              v-model="form.message"
              required
              placeholder="Mesajınızı giriniz"
              rows="5"
            ></textarea>
          </div>

          <button type="submit" class="submit-button">
            Gönder
          </button>
        </form>
      </div>
    </div>
  </div>

  <Footer />
</template>

<style>
.contact-page {
  min-height: calc(100vh - 147px);
  background-color: #fff;
  padding: 2rem 0;
  margin-top: 107px;
  position: relative;
  overflow-x: hidden;
}

.contact-page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Store Info Styles */
.store-info {
  background: #fff;
  padding: 2rem;
  margin-bottom: 2rem;
  text-align: center;
  border-bottom: 1px solid #eee;
}

.store-info h1 {
  font-size: 1.8rem;
  color: #1a1a1a;
  margin-bottom: 1rem;
}

.address {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 1.5rem;
}

.contact-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  color: #666;
}

.work-hours, .phone, .email {
  margin: 0;
}

/* Contact Marquee Styles */
.contact-marquee {
  background: #000;
  color: #fff;
  overflow: hidden;
  width: 100vw;
  padding: 12px 0;
  margin: 2rem 0;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
}

.marquee-content {
  display: flex;
  width: 100%;
}

.marquee-items {
  display: flex;
  animation: marquee 30s linear infinite;
  white-space: nowrap;
}

.marquee-items span {
  margin-right: 50px;
  font-weight: 500;
}

@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
}

/* Contact Form Styles */
.contact-form-container {
  background: #fff;
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
}

.contact-form-container h2 {
  font-size: 1.5rem;
  color: #1a1a1a;
  margin-bottom: 2rem;
  text-align: center;
}

.contact-form {
  width: 100%;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
  color: #666;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.875rem;
  border: 1px solid #eee;
  border-radius: 4px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #1a1a1a;
  outline: none;

}

.contact-phone-input {
  display: flex;
  align-items: center;
  border: 2px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  padding: 0 !important
}

.country-code {
  background-color: #f8f8f8;
  padding: 0.875rem;
  color: #666;
  font-weight: 500;
  border-right: 1px solid #eee;
}

.contact-phone-input input {
  border: none !important;
  border-radius: 0 !important;
}

.contact-phone-input:focus-within {
  border-color: #1a1a1a;
}

.submit-button {
  width: 100%;
  padding: 1rem;
  background-color: #1a1a1a;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-button:hover {
  background-color: #333;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .contact-page {
    padding: 1rem;
    margin-top: 107px;
  }
  
  .store-info,
  .contact-form-container {
    padding: 1.5rem;
  }
  
  .store-info h1 {
    font-size: 1.5rem;
  }
  
  .address {
    font-size: 1rem;
  }

  .marquee-items span {
    margin-right: 30px;
    font-size: 0.9rem;
  }
}

@media (max-width: 576px) {
  .contact-page {
    padding: 0.5rem;
    margin-top: 107px;
  }
  
  .store-info,
  .contact-form-container {
    padding: 1rem;
  }
  
  .store-info h1 {
    font-size: 1.3rem;
  }

  .address {
    font-size: 0.9rem;
  }

  .contact-details {
    font-size: 0.9rem;
  }

  .contact-marquee {
    padding: 8px 0;
  }

  .marquee-items span {
    margin-right: 20px;
    font-size: 0.8rem;
  }

  .contact-form-container h2 {
    font-size: 1.3rem;
    margin-bottom: 1.5rem;
  }

  .form-group label {
    font-size: 0.9rem;
  }

  .form-group input,
  .form-group textarea {
    padding: 0.75rem;
    font-size: 0.9rem;
  }

  .country-code {
    padding: 0.75rem;
    font-size: 0.9rem;
  }

  .submit-button {
    padding: 0.875rem;
    font-size: 0.9rem;
  }
}
</style>