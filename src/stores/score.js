import { defineStore } from 'pinia'
import debounce from 'lodash.debounce'
import { updateScore } from '@/api/app' // Make sure this method sends the score to the backend

const debouncedUpdateScore = debounce(updateScore, 500)

const baseLevelScore = 25
// [25, 50, 100]
const levels = new Array(15)
  .fill(0)
  .map((_, i) => baseLevelScore * Math.pow(2, i))

const levelScores = levels.map((_, level) => {
  let sum = 0
  for (let [index, value] of levels.entries()) {
    if (index >= level) {
      return sum + value
    }
    sum += value
  }
  return sum
})

function computeLevelByScore(score) {
  for (let [index, value] of levelScores.entries()) {
    if (score <= value) {
      return {
        level: index,
        value: levels[index],
      }
    }
  }
}

export const useScoreStore = defineStore('score', {
  state: () => ({
    score: 0,
    previousLevel: 0,
    clicks: 1000,
    maxClicks: 1000,
    regenInterval: null,
    background: null,
  }),
  getters: {
    level: (state) => computeLevelByScore(state.score),
    currentScore(state) {
      if (this.level.level === 0) {
        return state.score
      }
      return state.score - levelScores[this.level.level - 1]
    },
    canClick(state) {
      return state.clicks > 0
    },
  },
  actions: {
    add(score = 1) {
      if (this.canClick) {
        this.score += score
        this.clicks -= 1
        this.checkLevelChange()
        debouncedUpdateScore(this.score) // Debounced update
      }
    },
    setScore(score) {
      this.score = score
      this.checkLevelChange()
      debouncedUpdateScore(this.score) // Send to backend when score is set
    },
    setBackground(background) {
      this.background = background
    },
    async updateScoreInDatabase() {
      // This method will update the score in the backend
      try {
        await updateScore(this.score)  // Assuming updateScore sends the score to your API
        console.log('Score updated in the database')
      } catch (error) {
        console.error('Failed to update score:', error)
      }
    },
    checkLevelChange() {
      const currentLevel = this.level.level
      if (currentLevel !== this.previousLevel) {
        this.previousLevel = currentLevel
        console.log(`Level changed to: ${currentLevel}`)
      }
    },
    startClickRegen() {
      if (this.regenInterval) {
        clearInterval(this.regenInterval)
      }
      
      this.regenInterval = setInterval(() => {
        if (this.clicks < this.maxClicks) {
          this.clicks += 1
        }
      }, 1000)
    },
    init() {
      this.startClickRegen()
      this.checkLevelChange()
    }
  },
  persist: true,
})
