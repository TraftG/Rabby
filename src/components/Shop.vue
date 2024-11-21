<template>
  <div class="shop">
    <button @click="openInvoice">Buy Skins</button>
  </div>
</template>

<script>
import { useWebAppNavigation } from 'vue-tg';

let getInvoiceLink = async () => {
  try {
    console.log('Запрос на получение ссылки на счёт отправлен');
    const response = await fetch('http://localhost:5173/tg/getInvoiceLink', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
    });

    if (!response.ok) {
      console.error('Ошибка при получении ответа:', response.status, response.statusText);
      return { success: false, error: 'Ошибка при получении ответа' };
    }

    const invoiceLink = await response.json();
    console.log('Ответ получен:', invoiceLink);
    return invoiceLink;
  } catch (error) {
    console.error('Ошибка во время запроса:', error);
    return { success: false, error: error.message };
  }
};

let openInvoice = async () => {
  try {
    console.log('Попытка получить ссылку на счёт');
    const getInvoiceLinkResult = await getInvoiceLink();

    if (getInvoiceLinkResult.success) {
      const invoiceLink = getInvoiceLinkResult.data;
      console.log('Ссылка на счёт успешно получена:', invoiceLink);

      const webAppNavigation = useWebAppNavigation();
      webAppNavigation.openInvoice(invoiceLink, (url, status) => {
        console.log('Окно счёта открыто:', { url, status });
      });
    } else {
      console.error('Не удалось получить ссылку на счёт:', getInvoiceLinkResult.error);
    }
  } catch (error) {
    console.error('Ошибка во время открытия счёта:', error);
  }
};
</script>

<style>
.shop {
  text-align: center;
}

.skin-item {
  margin: 20px;
}
</style>
