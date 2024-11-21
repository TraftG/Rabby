import supabase from '@/services/supabase';
import { useTelegram } from '@/services/telegram';
import { useScoreStore } from '@/stores/score';

const { user } = useTelegram();
const MY_ID = parseInt(user?.id ?? 4252, 10); // Telegram ID как число

// Получить все задачи
export async function fetchTasks() {
  try {
    const { data, error } = await supabase.from('tasks').select('*');
    if (error) {
      console.error('Ошибка при получении задач:', error.message);
      return [];
    }
    return data;
  } catch (error) {
    console.error('Неизвестная ошибка при получении задач:', error);
    return [];
  }
}

// Получить или создать пользователя
export async function getOrCreateUser() {
  try {
    const { data: existingUsers, error } = await supabase
      .from('users')
      .select()
      .eq('telegram', MY_ID);

    if (error) {
      console.error('Ошибка при получении пользователя:', error.message);
      return null;
    }

    if (existingUsers.length > 0) {
      return existingUsers[0];
    }

    const newUser = {
      telegram: MY_ID,
      friends: {},
      tasks: {},
      score: 0,
    };

    const { data: insertedUser, error: insertError } = await supabase
      .from('users')
      .insert(newUser)
      .select()
      .single();

    if (insertError) {
      console.error('Ошибка при создании пользователя:', insertError.message);
      return null;
    }

    return insertedUser;
  } catch (error) {
    console.error('Неизвестная ошибка при создании/получении пользователя:', error);
    return null;
  }
}

// Обновить счет
export async function updateScore(score) {
  try {
    const { error } = await supabase
      .from('users')
      .update({ score })
      .eq('telegram', MY_ID);

    if (error) {
      console.error('Ошибка при обновлении счета:', error.message);
    } else {
      console.log('Счет успешно обновлен!');
    }
  } catch (error) {
    console.error('Неизвестная ошибка при обновлении счета:', error);
  }
}

// Зарегистрировать друга
export async function registerRef(userName, refId) {
  try {
    const refTelegramId = parseInt(refId, 10); // Конвертируем в число
    if (isNaN(refTelegramId)) {
      console.error('Неверный формат Telegram ID:', refId);
      return;
    }

    const { data, error } = await supabase
      .from('users')
      .select()
      .eq('telegram', refTelegramId);

    if (error) {
      console.error('Ошибка при поиске пользователя для регистрации друга:', error.message);
      return;
    }

    if (!data || data.length === 0) {
      console.warn('Друг с указанным Telegram ID не найден.');
      return;
    }

    const refUser = data[0];

    const { error: updateError } = await supabase
      .from('users')
      .update({
        friends: { ...refUser.friends, [MY_ID]: userName },
        score: refUser.score + 50,
      })
      .eq('telegram', refTelegramId);

    if (updateError) {
      console.error('Ошибка при обновлении друга и счета:', updateError.message);
    } else {
      console.log('Друг успешно зарегистрирован!');
    }
  } catch (error) {
    console.error('Неизвестная ошибка при регистрации друга:', error);
  }
}

// Завершить задачу
export async function completeTask(task) {
  try {
    const scoreStore = useScoreStore();
    const newScore = scoreStore.score + task.amount;
    scoreStore.setScore(newScore);

    const { error } = await supabase
      .from('users')
      .update({
        tasks: { ...task.tasks, [task.id]: true },
        score: newScore,
      })
      .eq('telegram', MY_ID);

    if (error) {
      console.error('Ошибка при обновлении задачи и счета:', error.message);
    } else {
      console.log('Задача успешно завершена!');
    }
  } catch (error) {
    console.error('Неизвестная ошибка при завершении задачи:', error);
  }
}
