<template>
  <div class="game-container">
    <ScoreProgress />
    
    <!-- Кнопка для подключения кошелька -->
    <div class="wallet-button">
      <TonConnectButton />
    </div>
    <div class="header">
      <h2 class="score" id="score">{{ store.score }} Rabi</h2>
    </div>
    
    <div class="circle">
      <img 
        @click="increment" 
        ref="img" 
        id="circle" 
        :src="currentSkin" 
        alt="player-skin" 
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ScoreProgress from '@/components/ScoreProgress.vue'
import { useScoreStore } from '@/stores/score'
import frog from '@/assets/rabby1.jpg'
import lizard from '@/assets/frog.jpg'
import { TonConnectButton } from 'ton-ui-vue'
import mixpanel from 'mixpanel-browser'

// Инициализация Mixpanel
mixpanel.init('dd53dc09474c6337c7e7826186e2cc14')

// Уникальный ID пользователя (можно заменить на ID из системы)
const userId = 'user_' + Math.random().toString(36).substring(2, 15)

// Установить данные о пользователе при загрузке компонента
onMounted(() => {
  mixpanel.identify(userId)
  mixpanel.people.set({
    $distinct_id: userId,
    $created: new Date().toISOString(),
    app: 'My Vue Game',
  })
  fetchUserSkin() // Загрузка скина при монтировании
})

// Локальные переменные
const img = ref(null)
const store = useScoreStore()

// Список доступных скинов
const skins = ref([
  { id: 'default', image: frog, owned: true }, // Скин по умолчанию
  { id: 'lizard', image: lizard, owned: false }, // Дополнительный скин
])

// Текущий выбранный скин
const currentSkin = computed(() => {
  const ownedSkin = skins.value.find(skin => skin.owned)
  return ownedSkin ? ownedSkin.image : frog
})

// Имитация API запроса для получения скина
async function fetchUserSkin() {
  try {
    const response = await fetch('/api/user-skin') // Заглушка
    const { skinId } = await response.json()
    const userSkin = skins.value.find(skin => skin.id === skinId)
    if (userSkin) userSkin.owned = true
  } catch (error) {
    console.error('Ошибка загрузки скина:', error)
  }
}

// Увеличение очков
function increment(event) {
  store.add(1)

  // Отправка события в Mixpanel при увеличении очков
  mixpanel.track('Score Incremented', {
    score: store.score,
    userId: userId,
  })

  // Анимация клика
  const rect = event.target.getBoundingClientRect()
  const offsetX = event.clientX - rect.left - rect.width / 2
  const offsetY = event.clientY - rect.top - rect.height / 2

  const DEG = 40
  const tiltX = (offsetY / rect.height) * DEG
  const tiltY = (offsetX / rect.width) * -DEG

  img.value.style.setProperty('--tiltX', `${tiltX}deg`)
  img.value.style.setProperty('--tiltY', `${tiltY}deg`)

  setTimeout(() => {
    img.value.style.setProperty('--tiltX', `0deg`)
    img.value.style.setProperty('--tiltY', `0deg`)
  }, 300)

  // Всплывающий текст "+1"
  const plusOne = document.createElement('div')
  plusOne.classList.add('plus-one')
  plusOne.textContent = '+1'
  plusOne.style.left = `${event.clientX - rect.left}px`
  plusOne.style.top = `${event.clientY - rect.top}px`

  img.value.parentElement.appendChild(plusOne)

  setTimeout(() => plusOne.remove(), 2000)
}
</script>

<style scoped>
.wallet-button {
  position: absolute;
  top: 20px;
  right: 30px;
  z-index: 10;
}

.score {
  margin-top: 20px;
  font-size: 2rem;
}

.circle {
  margin-top: 50px;
}

#circle {
  width: 200px;
  height: 200px;
  cursor: pointer;
  transition: transform 0.2s;
}

.plus-one {
  position: absolute;
  color: #ff6347;
  font-size: 1.5rem;
  animation: move-up 2s ease-out forwards;
}

@keyframes move-up {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-50px);
  }
}
</style>
