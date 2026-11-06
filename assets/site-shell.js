(() => {
  const header = document.querySelector("[data-site-header]");
  const footer = document.querySelector("[data-site-footer]");
  const page = document.body.dataset.page;
  const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#${name}"/></svg>`;
  const current = (name) => page === name ? ' aria-current="page"' : "";
  const links = `
    <a href="index.html"${current("home")}>Главная</a>
    <a href="menu.html"${current("menu")}>Меню и доставка</a>
    <a href="loyalty.html"${current("loyalty")}>Карта гостя</a>
    <a href="index.html#contacts">Контакты</a>`;
  const booking = `<button type="button" class="nav-booking" data-open="booking" aria-haspopup="dialog"><span class="nav-booking-full">Забронировать</span><span class="nav-booking-short">Бронь</span></button>`;

  header.innerHTML = `
    <a class="skip-link" href="#main">К содержанию</a>
    <svg class="symbols" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <symbol id="arrow" viewBox="0 0 24 24"><path d="M4 12h15M13 6l6 6-6 6"/></symbol>
      <symbol id="arrow-up" viewBox="0 0 24 24"><path d="M6 18 18 6M7 6h11v11"/></symbol>
      <symbol id="bag" viewBox="0 0 24 24"><path d="M5 8h14l1 12H4L5 8Zm4 1V6a3 3 0 1 1 6 0v3"/></symbol>
      <symbol id="plus" viewBox="0 0 24 24"><path d="M5 12h14M12 5v14"/></symbol>
      <symbol id="close" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></symbol>
      <symbol id="menu-icon" viewBox="0 0 24 24"><path d="M4 8h16M4 16h16"/></symbol>
      <symbol id="chevron" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></symbol>
    </svg>
    <header class="site-header">
      <div class="frame header-inner">
        <a class="brand" href="index.html" aria-label="Кафе «Ялта», главная"><img src="assets/yalta.svg?v=3" width="116" height="36" alt="Ялта"></a>
        <nav class="desktop-nav" aria-label="Основная навигация">${links}</nav>
        <div class="header-actions">
          ${booking}
          <button type="button" class="cart-trigger" data-open="cart" aria-haspopup="dialog" aria-label="Открыть корзину">${icon("bag")}<span class="cart-badge" data-cart-count>0</span></button>
          <button type="button" class="nav-toggle" data-nav-toggle aria-expanded="false" aria-controls="mobile-nav" aria-label="Навигация">${icon("menu-icon")}</button>
        </div>
        <nav class="mobile-nav" id="mobile-nav" aria-label="Навигация на телефоне" data-mobile-nav hidden>${links}${booking}</nav>
      </div>
    </header>`;

  footer.innerHTML = `
    <footer class="site-footer">
      <div class="frame footer-inner">
        <a class="footer-brand" href="index.html" aria-label="Кафе «Ялта», главная"><img src="assets/yalta.svg?v=3" width="132" height="42" alt="Ялта"></a>
        <p>Кафе домашней кухни</p>
        <nav aria-label="Навигация внизу страницы">${links}${booking}</nav>
        <small>Демонстрационная версия для согласования</small>
      </div>
    </footer>
    <dialog class="panel cart-panel" data-dialog="cart" aria-labelledby="cart-title">
      <div class="panel-top"><div><p class="eyebrow">Доставка</p><h2 id="cart-title">Корзина</h2></div><button type="button" class="panel-close" data-close aria-label="Закрыть корзину">${icon("close")}</button></div>
      <div class="cart-empty" data-cart-empty><p>Корзина пока пуста.</p><a href="menu.html" class="text-button" data-close>Перейти в меню ${icon("arrow")}</a></div>
      <ul class="cart-items" data-cart-items></ul>
      <div class="cart-total"><span>Итого</span><strong data-cart-total>0 ₽</strong></div>
      <button class="button button-blue panel-action" type="button" data-checkout aria-controls="demo-checkout" aria-expanded="false" disabled>К оформлению ${icon("arrow")}</button>
      <p class="panel-note">Демонстрационная корзина</p>
      <form class="checkout-form" id="demo-checkout" data-checkout-form autocomplete="off" hidden>
        <p class="panel-note">Для проверки используйте вымышленные адрес и телефон.</p>
        <label>Адрес доставки <input type="text" name="address" placeholder="Примерная улица, 7" maxlength="160" required></label>
        <label>Телефон <input type="tel" name="phone" placeholder="+7 (000) 000-00-00" maxlength="24" required></label>
        <button class="button button-blue panel-action" type="submit">Проверить демозаказ ${icon("arrow")}</button>
      </form>
      <p class="panel-status" data-checkout-status role="status"></p>
    </dialog>
    <dialog class="panel booking-panel" data-dialog="booking" aria-labelledby="booking-title">
      <div class="panel-top"><div><p class="eyebrow">Кафе «Ялта»</p><h2 id="booking-title">Забронировать столик</h2></div><button type="button" class="panel-close" data-close aria-label="Закрыть бронирование">${icon("close")}</button></div>
      <p class="panel-description">Выберите дату, время и число гостей.</p>
      <form class="booking-form" data-booking-form aria-describedby="booking-note">
        <label>Дата <input type="date" name="date" required></label>
        <label>Гостей <select name="guests" required>
          <option value="1">1 гость</option><option value="2" selected>2 гостя</option><option value="3">3 гостя</option><option value="4">4 гостя</option><option value="5">5 гостей</option><option value="6">6 гостей</option><option value="7">7 гостей</option><option value="8">8 гостей</option>
        </select></label>
        <label class="booking-time">Время <select name="time" required>
          <option value="">Выбрать время</option><option>12:00</option><option>12:30</option><option>13:00</option><option>13:30</option><option>14:00</option><option>14:30</option><option>15:00</option><option>15:30</option><option>16:00</option><option>16:30</option><option>17:00</option><option>17:30</option><option>18:00</option><option>18:30</option><option>19:00</option><option>19:30</option><option>20:00</option><option>20:30</option><option>21:00</option><option>21:30</option>
        </select></label>
        <button type="submit" class="button button-blue panel-action">Посмотреть демобронь ${icon("arrow")}</button>
      </form>
      <p class="panel-note" id="booking-note">Время приведено для примера. Сервис бронирования подключим после согласования.</p>
      <p class="panel-status" data-booking-status role="status" aria-atomic="true"></p>
    </dialog>
    <p class="visually-hidden" data-announcement role="status" aria-atomic="true"></p>`;
})();
