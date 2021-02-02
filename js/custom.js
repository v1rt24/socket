jQuery(document).ready(function () {

  let madams;

  function checkLocalStorage () {
    if (localStorage.getItem('desc') && localStorage.getItem('desc') === location.href) {
      jQuery('.cardButton button').remove();
      return true;
    }
    return false;
  }

  checkLocalStorage();

  let socket = new WebSocket('ws://127.0.0.1:12345');

  socket.onmessage = function (event) {

    madams = JSON.parse(event.data);

    const arr = Object.entries(madams).flatMap(cur => cur[1]);

    jQuery('.wrapperCard').each((i, el) => {
      jQuery(el).find('.count').text(arr[i].count);
    });
  };

  socket.onerror = function (error) {
    console.log(`[error] ${error.message}`);
  };

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

      socket.send(JSON.stringify(madams));

      jQuery('.cardButton button').remove();
      localStorage.setItem('desc', location.href);
    }
  });

});