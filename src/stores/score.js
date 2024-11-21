import { defineStore } from 'pinia'
import debounce from 'lodash.debounce'
import { updateScore } from '@/api/app'

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
    previousLevel: 0, // Добавим состояние для предыдущего уровня
    clicks: 1000, // Начальное количество кликов
    maxClicks: 1000, // Лимит кликов
    regenInterval: null, // Ссылка на интервал
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
        this.checkLevelChange()  // Проверка на изменение уровня
        debouncedUpdateScore(this.score)
      }
    },
    setScore(score) {
      this.score = score
      this.checkLevelChange()  // Проверка на изменение уровня после установки счета
    },
    checkLevelChange() {
      const currentLevel = this.level.level
      if (currentLevel !== this.previousLevel) {
        this.previousLevel = currentLevel
        // Дополнительные действия при изменении уровня, например, отправка данных на сервер или обновление UI
        console.log(`Level changed to: ${currentLevel}`)
      }
    },
    startClickRegen() {
      // Если уже существует интервал, очистить его
      if (this.regenInterval) {
        clearInterval(this.regenInterval)
      }
      
      // Каждый 30 секунд прибавляем 1 клик
      this.regenInterval = setInterval(() => {
        if (this.clicks < this.maxClicks) {
          this.clicks += 1
        }
      }, 1000) // 30 секунд
    },
    init() {
      this.startClickRegen()
      this.checkLevelChange() // Вызов checkLevelChange в правильном контексте
    }
  },
  // Вызываем startClickRegen сразу при инициализации store
  // Чтобы начать восстановление кликов
  persist: true,  // Если вы хотите сохранять состояние между перезагрузками
})
