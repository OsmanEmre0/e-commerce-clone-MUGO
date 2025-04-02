<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import siteData from '../data/siteData.json';

const router = useRouter();
const footerData = siteData.footer;
const activeColumn = ref(null);

const toggleColumn = (index) => {
  if (activeColumn.value === index) {
    activeColumn.value = null;
  } else {
    activeColumn.value = index;
  }
};

const navigateToContact = () => {
  router.push('/contact');
};

const navigateToHome = () => {
  router.push('/').then(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
};

const navigateToReturnPolicy = () => {
  router.push('/iade-kosullari').then(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
};

const navigateToSalesAgreement = () => {
  router.push('/satis-sozlesmesi').then(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
};

const navigateToPreInfo = () => {
  router.push('/on-bilgilendirme').then(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
};
</script>

<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-columns">
        <div v-for="(column, index) in footerData.columns" :key="index" class="footer-column">
          <div class="column-header" @click="toggleColumn(index)">
            <h3>{{ column.title }}</h3>
            <span class="toggle-icon">
              <i :class="activeColumn === index ? 'bi bi-dash' : 'bi bi-plus'"></i>
            </span>
          </div>
          <ul class="footer-links" :class="{ 'active': activeColumn === index }">
            <li v-for="(link, linkIndex) in column.links" :key="linkIndex">
              <a 
                v-if="link.name === 'İletişim'" 
                href="#" 
                @click.prevent="navigateToContact"
              >
                {{ link.name }}
              </a>
              <a 
                v-else-if="link.name === 'Anasayfa'" 
                href="#" 
                @click.prevent="navigateToHome"
              >
                {{ link.name }}
              </a>
              <a 
                v-else-if="link.name === 'İade Koşulları'" 
                href="#" 
                @click.prevent="navigateToReturnPolicy"
              >
                {{ link.name }}
              </a>
              <a 
                v-else-if="link.name === 'Satış Sözleşmesi'" 
                href="#" 
                @click.prevent="navigateToSalesAgreement"
              >
                {{ link.name }}
              </a>
              <a 
                v-else-if="link.name === 'Ön Bilgilendirme'" 
                href="#" 
                @click.prevent="navigateToPreInfo"
              >
                {{ link.name }}
              </a>
              <router-link 
                v-else-if="link.name === 'SSS'" 
                to="/sss"
              >
                {{ link.name }}
              </router-link>
              <a 
                v-else 
                :href="link.url"
              >
                {{ link.name }}
              </a>
            </li>
          </ul>
        </div>
        
        <div class="footer-column qr-column">
          <div class="qr-code">
            <img :src="footerData.qrCode.image" alt="QR Code" class="qr-image">
            <p class="qr-text">{{ footerData.qrCode.text }}</p>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <div class="social-icons">
          <a 
            v-for="social in footerData.socialIcons" 
            :key="social.name" 
            :href="social.url" 
            class="social-icon" 
            :aria-label="social.name"
          >
            <i :class="social.icon"></i>
          </a>
        </div>
        
        <div class="copyright">
          <p>{{ footerData.copyright }}</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<style>
.footer {
  background-color: #000;
  color: #fff;
  padding: 50px 0 20px;
  margin-top: 60px;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

.footer-columns {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 40px;
}

.footer-column {
  flex: 1;
  min-width: 200px;
  margin-bottom: 20px;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.toggle-icon {
  display: none;
  font-size: 18px;
}

.footer-column h3 {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #fff;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 1000px;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.footer-links li {
  margin-bottom: 10px;
}

.footer-links a {
  color: #fff;
  text-decoration: none;
  font-size: 14px;
  position: relative;
  display: inline-block;
  padding: 2px 0;
  overflow: hidden;
}

.footer-links a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background-color: #ff0000;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.3s ease, background-color 0.3s ease;
}

.footer-links a:hover {
  color: #ff0000;
}

.footer-links a:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}

.qr-column {
  display: flex;
  justify-content: center;
}

.qr-code {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qr-image {
  width: 120px;
  height: auto;
  margin-bottom: 10px;
}

.qr-text {
  font-size: 12px;
  color: #ff0000;
  text-align: center;
}

.footer-bottom {
  border-top: 1px solid #333;
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.social-icons {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.social-icon {
  color: #fff;
  font-size: 24px;
  transition: transform 0.3s ease, color 0.3s ease;
}

.social-icon:hover {
  color: #ff0000;
  transform: translateY(-3px);
}

.copyright {
  font-size: 14px;
  color: #ccc;
  text-align: center;
}

@media (max-width: 991px) {
  .footer-columns {
    flex-direction: column;
  }
  
  .footer-column {
    margin-bottom: 0;
    border-bottom: 1px solid #333;
  }
  
  .qr-column {
    border-bottom: none;
    margin-top: 20px;
  }
  
  .column-header {
    padding: 15px 0;
  }
  
  .toggle-icon {
    display: block;
  }
  
  .footer-column h3 {
    margin-bottom: 0;
  }
  
  .footer-links {
    max-height: 0;
    margin-top: 0;
    transition: max-height 0.3s ease;
  }
  
  .footer-links.active {
    max-height: 500px;
    margin-top: 15px;
    margin-bottom: 15px;
  }
  
  .qr-code {
    margin-top: 20px;
  }
}
</style>