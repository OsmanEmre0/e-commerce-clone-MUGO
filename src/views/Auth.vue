<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Navbar from '../components/Navbar.vue';
import Footer from '../components/Footer.vue';

const route = useRoute();
const router = useRouter();
const isLogin = ref(true);

onMounted(() => {
  if (route.query.type === 'register') {
    isLogin.value = false;
  } else {
    isLogin.value = true;
  }
});

const email = ref('');
const password = ref('');
const firstName = ref('');
const lastName = ref('');
const birthDate = ref('');
const showPassword = ref(false);
const acceptTerms = ref(false);
const acceptNewsletter = ref(false);

const toggleView = () => {
  isLogin.value = !isLogin.value;
  router.push({ 
    path: '/auth', 
    query: { type: isLogin.value ? 'login' : 'register' } 
  });
  // Reset ALL form fields
  email.value = '';
  password.value = '';
  firstName.value = '';
  lastName.value = '';
  birthDate.value = '';
  acceptTerms.value = false;
  acceptNewsletter.value = false;
  showPassword.value = false;
};

const handleLogin = () => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => u.email === email.value && u.password === password.value);
  
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    router.push('/profile');
  } else {
    alert('Hatalı email veya şifre!');
    email.value = '';
    password.value = '';
  }
};

const handleRegister = () => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  // Check if email already exists
  if (users.some(u => u.email === email.value)) {
    alert('Bu email adresi zaten kayıtlı!');
    return;
  }
  
  const newUser = {
    id: Date.now(),
    firstName: firstName.value,
    lastName: lastName.value,
    email: email.value,
    password: password.value,
    birthDate: birthDate.value,
    acceptNewsletter: acceptNewsletter.value
  };
  
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  
  // After registration, switch to login view
  isLogin.value = true;
  router.push({ 
    path: '/auth', 
    query: { type: 'login' } 
  });
  
  // Clear ALL form fields
  firstName.value = '';
  lastName.value = '';
  email.value = '';
  password.value = '';
  birthDate.value = '';
  acceptTerms.value = false;
  acceptNewsletter.value = false;
  showPassword.value = false;
  
  alert('Kayıt başarılı! Lütfen giriş yapın.');
};
</script>

<template>
  <Navbar />
  <div class="auth-page">
    <div class="auth-container">
      <!-- Modern Auth Tabs -->
      <div class="auth-tabs">
        <div class="tab-indicator" :class="{ 'right': !isLogin }"></div>
        <button 
          class="auth-tab" 
          :class="{ 'active': isLogin }"
          @click="isLogin = true"
        >
          Üye Girişi
        </button>
        <button 
          class="auth-tab" 
          :class="{ 'active': !isLogin }"
          @click="isLogin = false"
        >
          Üye Ol
        </button>
      </div>

      <!-- Login Form -->
      <div v-if="isLogin" class="auth-form">
        <form @submit.prevent="handleLogin" autocomplete="off">
          <div class="form-group">
            <label>Email</label>
            <input 
              type="email" 
              v-model="email" 
              placeholder="Email adresinizi giriniz"
              required
              autocomplete="new-email"
            >
          </div>

          <div class="form-group">
            <label>Şifre</label>
            <div class="password-input">
              <input 
                :type="showPassword ? 'text' : 'password'" 
                v-model="password" 
                placeholder="Şifrenizi giriniz"
                required
                autocomplete="new-password"
              >
              <button 
                type="button" 
                class="toggle-password"
                @click="showPassword = !showPassword"
              >
                <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="submit-button">Giriş Yap</button>
          </div>

          <div class="auth-links">
            <a href="#" class="forgot-password">Parolamı Unuttum</a>
          </div>

          <div class="social-login">
            <button type="button" class="google-login">
              <i class="bi bi-google"></i>
              Google ile giriş yap
            </button>
          </div>
        </form>
      </div>

      <!-- Register Form -->
      <div v-else class="auth-form">
        <form @submit.prevent="handleRegister" autocomplete="off">
          <div class="form-group">
            <label>
              <span class="required">*</span> Ad
            </label>
            <input 
              type="text" 
              v-model="firstName" 
              placeholder="Adınızı giriniz"
              required
              autocomplete="new-given-name"
            >
          </div>

          <div class="form-group">
            <label>
              <span class="required">*</span> Soyad
            </label>
            <input 
              type="text" 
              v-model="lastName" 
              placeholder="Soyadınızı giriniz"
              required
              autocomplete="new-family-name"
            >
          </div>

          <div class="form-group">
            <label>
              <span class="required">*</span> Email
            </label>
            <input 
              type="email" 
              v-model="email" 
              placeholder="Email adresinizi giriniz"
              required
              autocomplete="new-email"
            >
          </div>

          <div class="form-group">
            <label>
              <span class="required">*</span> Şifre
            </label>
            <div class="password-input">
              <input 
                :type="showPassword ? 'text' : 'password'" 
                v-model="password" 
                placeholder="Şifrenizi giriniz"
                required
                autocomplete="new-password"
              >
              <button 
                type="button" 
                class="toggle-password"
                @click="showPassword = !showPassword"
              >
                <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label>Doğum Tarihi</label>
            <input 
              type="date" 
              v-model="birthDate"
              autocomplete="bday"
            >
          </div>

          <div class="form-group checkbox-group">
            <div class="checkbox-wrapper">
              <input 
                type="checkbox" 
                id="terms" 
                v-model="acceptTerms"
                required
              >
              <label for="terms">
                <span class="required">*</span>
                <a href="#" class="terms-link">KVKK Aydınlatma Metnini</a> okudum, kabul ediyorum.
              </label>
            </div>
          </div>

          <div class="form-group checkbox-group">
            <div class="checkbox-wrapper">
              <input 
                type="checkbox" 
                id="newsletter" 
                v-model="acceptNewsletter"
              >
              <label for="newsletter">
                Kampanyalardan haberdar olmak için Ticari Elektronik İleti Onayı metnini okudum, onaylıyorum.
              </label>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="submit-button">Hesap Oluştur</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <Footer />
</template>

<style>
.auth-page {
  min-height: calc(100vh - 147px);
  background-color: #f8f8f8;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem;
  margin-top: 107px;
}

.auth-container {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

/* Modern Auth Tabs */
.auth-tabs {
  position: relative;
  display: flex;
  margin-bottom: 2rem;
  background: #f5f5f5;
  border-radius: 30px;
  padding: 5px;
  gap: 5px;
}

.tab-indicator {
  position: absolute;
  width: calc(50% - 5px);
  height: calc(100% - 10px);
  background: #000;
  border-radius: 25px;
  top: 5px;
  left: 5px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-indicator.right {
  transform: translateX(calc(100% + 5px));
}

.auth-tab {
  flex: 1;
  padding: 12px;
  font-size: 1rem;
  font-weight: 600;
  color: #666;
  background: none;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.auth-tab.active {
  color: #fff;
}

.auth-form {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #333;
  font-weight: 500;
}

.required {
  color: #ff0000;
  margin-right: 4px;
}

.form-group input:not([type="checkbox"]) {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #eee;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus {
  border-color: #000;
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
}

/* Checkbox Styles */
.checkbox-group {
  margin-bottom: 1rem;
}

.checkbox-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.checkbox-wrapper input[type="checkbox"] {
  width: 18px;
  height: 18px;
  margin-top: 3px;
  cursor: pointer;
  flex-shrink: 0;
}

.checkbox-wrapper label {
  font-size: 0.85rem;
  line-height: 1.4;
  margin: 0;
  cursor: pointer;
}

.password-input {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #666;
  transition: color 0.3s ease;
}

.toggle-password:hover {
  color: #000;
}

.submit-button {
  width: 100%;
  padding: 1rem;
  background-color: #000;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-button:hover {
  background-color: #333;
  transform: translateY(-1px);
}

.auth-links {
  margin-top: 1rem;
  text-align: center;
}

.forgot-password {
  color: #666;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.forgot-password:hover {
  color: #000;
}

.social-login {
  margin-top: 1.5rem;
}

.google-login {
  width: 100%;
  padding: 0.75rem;
  background-color: #fff;
  border: 2px solid #eee;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.google-login:hover {
  border-color: #000;
  background-color: #f8f8f8;
}

.terms-link {
  color: #ff0000;
  text-decoration: none;
  transition: color 0.3s ease;
}

.terms-link:hover {
  color: #cc0000;
}

/* Responsive styles */
@media (max-width: 768px) {
  .auth-page {
    padding: 1.5rem;
  }
  
  .auth-container {
    padding: 1.5rem;
  }
}

@media (max-width: 576px) {
  .auth-page {
    padding: 1rem;
  }
  
  .auth-container {
    padding: 1.25rem;
    margin: 0.5rem;
    border-radius: 8px;
  }
  
  .auth-tab {
    font-size: 0.9rem;
    padding: 0.75rem;
  }
  
  .form-group {
    margin-bottom: 1.25rem;
  }
  
  .form-group input:not([type="checkbox"]) {
    padding: 0.625rem;
    font-size: 0.9rem;
  }
  
  .submit-button {
    padding: 0.875rem;
    font-size: 0.9rem;
  }
  
  .checkbox-wrapper label {
    font-size: 0.8rem;
  }
  
  .google-login {
    padding: 0.625rem;
    font-size: 0.9rem;
  }
}

/* Small mobile devices */
@media (max-width: 360px) {
  .auth-page {
    padding: 0.5rem;
  }
  
  .auth-container {
    padding: 1rem;
  }
  
  .auth-tab {
    font-size: 0.85rem;
    padding: 0.5rem;
  }
}
</style>