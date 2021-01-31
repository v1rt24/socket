jQuery(document).ready(function () {

  let madams;

  // После голосования убираем кнопки и создаём localStorage,
  // чтобы после обновления страницы голосование было не доступно
  function checkLocalStorage () {
    if (localStorage.getItem('desc') && localStorage.getItem('desc') ===
      location.href) {
      jQuery('.cardButton button').remove();
      return true;
    }
    return false;
  }

  checkLocalStorage();

  ////////////////// СОЗДАЁМ СОКЕТ
  let socket = new WebSocket('ws://127.0.0.1:12345');

  // Сработает при подключении
  socket.onopen = function (e) {
    // console.log("[open] Соединение установлено");
    // console.log("Отправляем данные на сервер");
    // socket.send("Отправляем на сервер сообщение");
  };

  // Получаем данные с сервера
  socket.onmessage = function (event) {
    // console.log(`[message] Данные получены с сервера: ${event.data}`);

    madams = JSON.parse(event.data);

    const arr = Object.entries(madams).flatMap(cur => cur[1]);

    jQuery('.wrapperCard').each((i, el) => {
      jQuery(el).find('.count').text(arr[i].count);
    });
  };

  // Срабатывает при закрытии соединения
  socket.onclose = function (event) {
    if (event.wasClean) {
      console.log(
        `[close] Соединение закрыто чисто, код=${event.code} причина=${event.reason}`);
    }
    else {
      // например, сервер убил процесс или сеть недоступна
      // обычно в этом случае event.code 1006
      console.log('[close] Соединение прервано');
    }
  };

  // Срабатывает при ошибках соединения
  socket.onerror = function (error) {
    console.log(`[error] ${error.message}`);
  };
  ////////////////// / СОЗДАЁМ СОКЕТ

  jQuery('[data-fancybox]').fancybox({
    touch: false,
  });

  let name = '';
  jQuery('.wrapperCard').click(function () {
    const nameData = jQuery(this).data('name');
    name = nameData;
  });

  jQuery('#podelitsya').on('click', 'a', () => {
    jQuery.fancybox.close();

    if (!checkLocalStorage()) {
      if (madams[name]) {
        madams[name].count++;
      }
      else {
        madams[name] = {count: '1'};
      }

      // Отправляем данные на сервер
      socket.send(JSON.stringify(madams));

      // Удаляем кнопку и записываем в localStorage
      jQuery('.cardButton button').remove();
      localStorage.setItem('desc', location.href);
    }
  });

});//Конец ready