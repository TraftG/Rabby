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

// Initializing Mixpanel
mixpanel.init('dd53dc09474c6337c7e7826186e2cc14')

const userId = 'user_' + Math.random().toString(36).substring(2, 15)

onMounted(() => {
  mixpanel.identify(userId)
  mixpanel.people.set({
    $distinct_id: userId,
    $created: new Date().toISOString(),
    app: 'My Vue Game',
  })
  fetchUserSkin() 
})

// Local variables
const img = ref(null)
const store = useScoreStore()

// Available skins
const skins = ref([
  { id: 'default', image: frog, owned: true }, 
  { id: 'lizard', image: lizard, owned: false }, 
])

// Current selected skin
const currentSkin = computed(() => {
  const ownedSkin = skins.value.find(skin => skin.owned)
  return ownedSkin ? ownedSkin.image : frog
})

async function fetchUserSkin() {
  try {
    const response = await fetch('/api/user-skin') 
    const { skinId } = await response.json()
    const userSkin = skins.value.find(skin => skin.id === skinId)
    if (userSkin) userSkin.owned = true
  } catch (error) {
    console.error('Error fetching skin:', error)
  }
}

// Increment function when clicking the circle
function increment(event) {
  store.add(1)

  // Track the score increment in Mixpanel
  mixpanel.track('Score Incremented', {
    score: store.score,
    userId: userId,
  })

  // Apply tilt effect based on click position
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

  // Show "+1" animation on click
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
