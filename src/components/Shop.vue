<template>
  <div :style="{ backgroundImage: 'url(' + currentBackground.image + ')' }" class="shop-container">
    <h2 class="shop-title">Магазин фонов</h2>

    <div class="coin-balance">
      <p>Ваши коины: {{ store.score }}</p>
    </div>

    <div class="background-list">
      <div 
        v-for="background in backgrounds" 
        :key="background.id" 
        class="background-item"
      >
        <img :src="background.image" alt="Background" class="background-image" />
        <div class="background-details">
          <p>{{ background.name }}</p>
          <p>Цена: {{ background.price }} Rabi</p>
          <button 
            :disabled="store.score < background.price || store.purchasedBackgroundId === background.id"
            @click="buyBackground(background)"
            class="buy-button"
          >
            {{ store.purchasedBackgroundId === background.id ? 'Куплено' : 'Купить' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import bg1 from '@/assets/background1.jpg'
import bg2 from '@/assets/background2.jpg'
import bg3 from '@/assets/background3.jpg'

const store = useAppStore()

const backgrounds = ref([
  { id: 'bg1', name: 'Красный фон', image: bg1, price: 50 },
  { id: 'bg2', name: 'Зеленый фон', image: bg2, price: 100 },
  { id: 'bg3', name: 'Синий фон', image: bg3, price: 150 },
])

// Загружаем информацию о купленном фоне при монтировании компонента
onMounted(() => {
  store.loadPurchasedBackground() // Загружаем информацию о купленном фоне
})

// Функция покупки фона
async function buyBackground(background) {
  if (store.score >= background.price) {
    await store.buyBackground(background.id)  // Покупка фона
  } else {
    alert('У вас недостаточно монет!')
  }
}

// Определяем текущий фон на основе купленного фона
const currentBackground = computed(() => {
  return backgrounds.value.find(bg => bg.id === store.purchasedBackgroundId) || backgrounds.value[0]
})
</script>

<style scoped>
.shop-container {
  padding: 20px;
  text-align: center;
  background-size: cover;
  min-height: 100vh;
  transition: background-image 0.3s ease-in-out;
}

.coin-balance {
  font-size: 1.5rem;
  margin-bottom: 20px;
}

.background-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.background-item {
  padding: 10px;
  border: 1px solid #ccc;
  text-align: center;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  transition: transform 0.2s ease;
}

.background-item:hover {
  transform: scale(1.05);
}

.background-image {
  width: 100%;
  height: auto;
  border-radius: 5px;
}

.background-details {
  margin-top: 10px;
}

button {
  margin-top: 10px;
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s;
}

button:hover:not(:disabled) {
  background-color: #45a049;
}

button:disabled {
  background-color: #ddd;
  cursor: not-allowed;
}
</style>
