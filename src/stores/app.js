import { getOrCreateUser, registerRef, fetchTasks, completeTask, getPurchasedBackground, updateBackgroundPurchased } from '@/api/app'
import { defineStore } from 'pinia'
import { useScoreStore } from './score'
import { useTelegram } from '@/services/telegram'

const { user } = useTelegram()

export const useAppStore = defineStore('app', {
  state: () => ({
    user: {},
    backgroundPurchased: false, // Добавляем состояние для купленного фона
    tasks: [],
  }),
  actions: {
    async init(ref) {
      this.user = await getOrCreateUser()

      const score = useScoreStore()

      // Обновление очков и проверка уровня
      score.score = this.user.score
      score.checkLevelChange()

      // Проверяем, куплен ли фон
      this.backgroundPurchased = await getPurchasedBackground()

      if (ref && +ref !== +this.user.telegram) {
        await registerRef(user?.first_name ?? 'Rabby Coin', ref)
      }
    },
    async completeTask(task) {
      await completeTask(this.user, task)
    },
    async fetchTasks() {
      this.tasks = await fetchTasks()
    },
    // Действие для покупки фона
    async buyBackground() {
      // Обновляем статус купленного фона в базе данных
      await updateBackgroundPurchased()
      // Обновляем состояние в приложении
      this.backgroundPurchased = true
      console.log('Фон успешно куплен и обновлен!')
    },
  },
})
