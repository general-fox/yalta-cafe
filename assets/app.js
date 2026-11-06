const money = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});
const bookingDate = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
});
const cartKey = "yalta-cafe-cart-v1";
const quantityLimit = 99;
const catalog = [
  { id: "syrniki", category: "breakfast", name: "Сырники со сметаной", weight: "180 г", description: "Творожные сырники с ягодным вареньем.", price: 460 },
  { id: "vareniki", category: "main", name: "Вареники с картофелем", weight: "250 г", description: "Ручная лепка, жареный лук и сметана.", price: 490 },
  { id: "chicken", category: "main", name: "Котлета по-киевски", weight: "280 г", description: "Куриное филе, сливочное масло и пюре.", price: 690 },
  { id: "tomatoes", category: "salad", name: "Томаты с душистым маслом", weight: "210 г", description: "Спелые томаты, сладкий лук и зелень.", price: 420 },
  { id: "honeycake", category: "dessert", name: "Медовик", weight: "140 г", description: "Тонкие медовые коржи и сметанный крем.", price: 390 },
  { id: "mors", category: "drinks", name: "Ягодный морс", weight: "300 мл", description: "Клюква и чёрная смородина.", price: 230 },
];
const products = new Map(catalog.map((item) => [
  item.id,
  { ...item, photo: `assets/${item.id}-blue.jpg` },
]));

const cart = new Map();
function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(cartKey) ?? "{}");
    cart.clear();
    for (const id of products.keys()) {
      const quantity = saved?.[id];
      if (Number.isInteger(quantity) && quantity > 0 && quantity <= quantityLimit) {
        cart.set(id, quantity);
      }
    }
  } catch {
    // The cart still works in memory when browser storage is unavailable.
  }
}

const filters = [...document.querySelectorAll("[data-filter]")];
const categoryToggle = document.querySelector("[data-category-toggle]");
const categoryLabel = document.querySelector("[data-category-label]");
const menuGrid = document.querySelector("[data-menu-grid]");
const menuCard = document.querySelector("[data-menu-card]");
const dialogs = new Map(
  [...document.querySelectorAll("dialog[data-dialog]")].map((dialog) => [
    dialog.dataset.dialog,
    dialog,
  ]),
);
const cartDialog = dialogs.get("cart");
const bookingDialog = dialogs.get("booking");
const cartItems = cartDialog?.querySelector("[data-cart-items]");
const cartEmpty = cartDialog?.querySelector("[data-cart-empty]");
const cartTotal = cartDialog?.querySelector("[data-cart-total]");
const checkoutButton = cartDialog?.querySelector("[data-checkout]");
const checkoutForm = cartDialog?.querySelector("[data-checkout-form]");
const deliveryAddress = checkoutForm?.querySelector('input[name="address"]');
const deliveryPhone = checkoutForm?.querySelector('input[name="phone"]');
const checkoutStatus = cartDialog?.querySelector("[data-checkout-status]");
const announcement = document.querySelector("[data-announcement]");
const bookingForm = document.querySelector("[data-booking-form]");
const bookingStatus = document.querySelector("[data-booking-status]");
const navToggle = document.querySelector("[data-nav-toggle]");
const mobileNav = document.querySelector("[data-mobile-nav]");

if (menuGrid && menuCard) {
  const categoryNames = new Map(filters.map((filter) => [filter.dataset.filter, filter.textContent.trim()]));
  for (const product of products.values()) {
    const card = menuCard.content.firstElementChild.cloneNode(true);
    card.dataset.product = product.id;
    card.querySelector(".dish-photo").src = product.photo;
    card.querySelector("[data-dish-category]").textContent = categoryNames.get(product.category);
    card.querySelector("[data-dish-weight]").textContent = product.weight;
    card.querySelector("[data-dish-name]").textContent = product.name;
    card.querySelector("[data-dish-description]").textContent = product.description;
    card.querySelector("[data-dish-price]").textContent = money.format(product.price);
    product.card = card;
    product.button = card.querySelector("[data-add]");
    product.buttonCount = card.querySelector("[data-add-count]");
    product.buttonLabel = `Добавить в корзину: ${product.name}`;
    menuGrid.append(card);
  }
}

function filterMenu(category) {
  for (const filter of filters) {
    const active = filter.dataset.filter === category;
    filter.classList.toggle("is-active", active);
    filter.setAttribute("aria-pressed", String(active));
    if (active && categoryLabel) categoryLabel.textContent = filter.textContent.trim();
  }

  for (const product of products.values()) {
    if (product.card) product.card.hidden = category !== "all" && product.category !== category;
  }
}

function itemText(tag, className, content) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = content;
  return element;
}

function cartButton(id, action, caption, label, className = "") {
  const button = itemText("button", className, caption);
  button.type = "button";
  button.dataset.cartAction = action;
  button.dataset.itemId = id;
  button.setAttribute("aria-label", label);
  return button;
}

function cartRow(product, quantity) {
  const { id, name, price, photo } = product;
  const row = itemText("li", "cart-row", "");

  if (photo) {
    const image = document.createElement("img");
    image.className = "cart-row-image";
    image.src = photo;
    image.alt = "";
    row.append(image);
  }

  const details = itemText("div", "cart-row-details", "");
  details.append(
    itemText("span", "cart-row-name", name),
    itemText("span", "cart-row-unit", money.format(price)),
  );

  const stepper = itemText("div", "cart-stepper", "");
  stepper.setAttribute("role", "group");
  stepper.setAttribute("aria-label", `Количество: ${name}`);
  const decrease = cartButton(id, "decrease", "−", `Уменьшить количество: ${name}`);
  const increase = cartButton(id, "increase", "+", `Увеличить количество: ${name}`);
  increase.disabled = quantity >= quantityLimit;
  stepper.append(decrease, itemText("span", "cart-row-quantity", quantity), increase);

  row.append(
    details,
    stepper,
    itemText("span", "cart-row-sum", money.format(price * quantity)),
    cartButton(id, "remove", "×", `Убрать из корзины: ${name}`, "cart-row-remove"),
  );
  return row;
}

function renderCart() {
  const activeControl = cartItems?.contains(document.activeElement)
    ? document.activeElement
    : null;
  const rows = document.createDocumentFragment();
  let count = 0;
  let total = 0;

  for (const [id, quantity] of cart) {
    const product = products.get(id);
    count += quantity;
    total += product.price * quantity;
    if (cartItems) rows.append(cartRow(product, quantity));
  }

  for (const display of document.querySelectorAll("[data-cart-count]")) {
    display.textContent = count;
  }
  for (const { id, button, buttonCount, buttonLabel } of products.values()) {
    if (!button) continue;
    const quantity = cart.get(id) ?? 0;
    button.toggleAttribute("data-in-cart", quantity > 0);
    button.disabled = quantity >= quantityLimit;
    if (buttonCount) {
      buttonCount.textContent = quantity || "";
      buttonCount.hidden = quantity === 0;
    }
    if (buttonLabel) {
      button.setAttribute("aria-label", quantity ? `${buttonLabel}. В корзине ${quantity}.` : buttonLabel);
    }
  }

  if (cartItems) {
    cartItems.replaceChildren(rows);
    cartItems.hidden = count === 0;
  }
  if (cartEmpty) cartEmpty.hidden = count > 0;
  if (cartTotal) cartTotal.textContent = money.format(total);
  if (checkoutButton) checkoutButton.disabled = count === 0;
  if (count === 0) closeCheckout();

  if (activeControl) {
    const controls = [...cartItems.querySelectorAll("[data-cart-action]:enabled")];
    const matching = controls.find((control) =>
      control.dataset.itemId === activeControl.dataset.itemId
      && control.dataset.cartAction === activeControl.dataset.cartAction,
    );
    const fallback = controls.find((control) =>
      control.dataset.itemId === activeControl.dataset.itemId,
    ) ?? controls[0] ?? cartDialog.querySelector("[data-close]");
    (matching ?? fallback)?.focus();
  }

  return total;
}

function clearCheckoutStatus() {
  if (checkoutStatus) checkoutStatus.textContent = "";
}

function closeCheckout() {
  if (checkoutForm) {
    checkoutForm.reset();
    checkoutForm.hidden = true;
  }
  deliveryAddress?.setCustomValidity("");
  deliveryPhone?.setCustomValidity("");
  checkoutButton?.setAttribute("aria-expanded", "false");
  clearCheckoutStatus();
}

function updateCart(id, quantity) {
  if (!products.has(id) || quantity > quantityLimit) return;
  if (quantity > 0) cart.set(id, quantity);
  else cart.delete(id);

  try {
    localStorage.setItem(cartKey, JSON.stringify(Object.fromEntries(cart)));
  } catch {
    // Storage can be disabled without affecting the current order preview.
  }

  clearCheckoutStatus();
  renderCart();

  if (announcement) {
    const { name } = products.get(id);
    announcement.textContent = quantity > 0
      ? `${name}. В корзине: ${quantity}.`
      : `${name} убрано из корзины.`;
  }
}

function closeMobileNav() {
  if (navToggle && mobileNav) {
    navToggle.setAttribute("aria-expanded", "false");
    mobileNav.hidden = true;
  }
}

function dateValue(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function validPhoneNumber(value) {
  const phone = value.trim();
  const digits = phone.replace(/\D/g, "");
  return /^\+?[\d\s().-]+$/.test(phone) && digits.length >= 10 && digits.length <= 15;
}

const bookingName = bookingForm?.querySelector('input[name="firstName"]');
const bookingPhone = bookingForm?.querySelector('input[name="phone"]');
const dateInput = bookingForm?.querySelector('input[name="date"]');
const bookingTime = bookingForm?.querySelector('[name="time"]');
function prepareBookingDate() {
  if (!dateInput) return;
  const nextDay = new Date();
  dateInput.min = dateValue(nextDay);
  if (!dateInput.value) {
    nextDay.setDate(nextDay.getDate() + 1);
    dateInput.value = dateValue(nextDay);
  }
}

prepareBookingDate();
cartDialog?.addEventListener("close", closeCheckout);

checkoutForm?.addEventListener("input", (event) => {
  event.target.setCustomValidity?.("");
  clearCheckoutStatus();
});

checkoutForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (cart.size === 0 || !checkoutStatus || !deliveryAddress || !deliveryPhone) return;

  deliveryAddress.setCustomValidity(deliveryAddress.value.trim() ? "" : "Введите адрес доставки.");
  deliveryPhone.setCustomValidity(validPhoneNumber(deliveryPhone.value) ? "" : "Введите телефон с 10–15 цифрами.");
  if (!checkoutForm.reportValidity()) return;

  const total = renderCart();
  checkoutStatus.textContent = `Пример заказа на ${money.format(total)}. Отправка заказов появится после подключения доставки.`;
});

bookingDialog?.addEventListener("close", () => {
  bookingForm?.reset();
  for (const field of [bookingName, bookingPhone, bookingTime]) field?.setCustomValidity("");
  if (bookingStatus) bookingStatus.textContent = "";
  prepareBookingDate();
});

bookingForm?.addEventListener("input", (event) => {
  event.target.setCustomValidity?.("");
  bookingTime?.setCustomValidity("");
  if (bookingStatus) bookingStatus.textContent = "";
});

bookingForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const now = new Date();
  if (dateInput) dateInput.min = dateValue(now);
  if (bookingName) bookingName.setCustomValidity(bookingName.value.trim() ? "" : "Введите имя.");
  if (bookingPhone) bookingPhone.setCustomValidity(validPhoneNumber(bookingPhone.value) ? "" : "Введите телефон с 10–15 цифрами.");
  if (!bookingForm.reportValidity() || !bookingStatus) return;

  const data = new FormData(bookingForm);
  const time = data.get("time");
  const guests = data.get("guests");
  const visit = new Date(`${data.get("date")}T${time}`);
  if (Number.isNaN(visit.getTime()) || !guests) return;
  if (visit <= now && bookingTime) {
    bookingTime.setCustomValidity("Выберите время будущего визита.");
    bookingTime.reportValidity();
    return;
  }

  const guestCount = new Intl.PluralRules("ru-RU").select(Number(guests));
  const guestLabel = { one: "гость", few: "гостя", many: "гостей" }[guestCount] ?? "гостя";
  bookingStatus.textContent = `Демобронь · ${bookingDate.format(visit)} в ${time} · ${guests} ${guestLabel}.`;
  bookingStatus.scrollIntoView({ block: "nearest" });
});

for (const dialog of dialogs.values()) {
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (
      event.clientX < rect.left || event.clientX > rect.right
      || event.clientY < rect.top || event.clientY > rect.bottom
    ) {
      dialog.close();
    }
  });
}

document.addEventListener("click", (event) => {
  const control = event.target.closest(
    "[data-filter], [data-category-toggle], [data-add], [data-open], [data-close], [data-cart-action], [data-checkout], [data-nav-toggle]",
  );
  if (!control) {
    if (event.target.closest("[data-mobile-nav] a")) closeMobileNav();
    return;
  }

  const { dataset } = control;
  if ("filter" in dataset) {
    filterMenu(dataset.filter);
    const url = new URL(window.location.href);
    if (dataset.filter === "all") url.searchParams.delete("category");
    else url.searchParams.set("category", dataset.filter);
    if (url.href !== window.location.href) history.replaceState(history.state, "", url);
    if (categoryToggle?.getAttribute("aria-expanded") === "true") {
      categoryToggle.setAttribute("aria-expanded", "false");
      categoryToggle.focus();
    }
  } else if ("categoryToggle" in dataset) {
    const open = control.getAttribute("aria-expanded") === "true";
    control.setAttribute("aria-expanded", String(!open));
  } else if ("add" in dataset) {
    const id = control.closest("[data-product]")?.dataset.product;
    updateCart(id, (cart.get(id) ?? 0) + 1);
  } else if ("open" in dataset) {
    const dialog = dialogs.get(dataset.open);
    if (!dialog) return;
    event.preventDefault();
    const previousDialog = control.closest("dialog[open]");
    if (previousDialog && previousDialog !== dialog) previousDialog.close();
    closeMobileNav();
    if (control.closest("[data-mobile-nav]")) navToggle?.focus();
    if (!dialog.open) dialog.showModal();
  } else if ("close" in dataset) {
    control.closest("dialog")?.close();
  } else if ("cartAction" in dataset) {
    const quantity = cart.get(dataset.itemId) ?? 0;
    const newQuantity = dataset.cartAction === "increase" ? quantity + 1 : quantity - 1;
    updateCart(dataset.itemId, dataset.cartAction === "remove" ? 0 : newQuantity);
  } else if ("checkout" in dataset && checkoutForm && cart.size > 0) {
    checkoutForm.hidden = false;
    checkoutButton.setAttribute("aria-expanded", "true");
    deliveryAddress?.focus();
  } else if ("navToggle" in dataset && mobileNav) {
    const open = navToggle.getAttribute("aria-expanded") !== "true";
    navToggle.setAttribute("aria-expanded", String(open));
    mobileNav.hidden = !open;
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (navToggle?.getAttribute("aria-expanded") === "true") {
    closeMobileNav();
    navToggle.focus();
  } else if (categoryToggle?.getAttribute("aria-expanded") === "true" && !document.querySelector("dialog[open]")) {
    categoryToggle.setAttribute("aria-expanded", "false");
    categoryToggle.focus();
  }
});

if (filters.length) {
  const requestedCategory = new URLSearchParams(window.location.search).get("category");
  const initialFilter = filters.find((filter) => filter.dataset.filter === requestedCategory);
  filterMenu(initialFilter?.dataset.filter ?? "all");
}
loadCart();
renderCart();

window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    loadCart();
    renderCart();
  }
});

window.addEventListener("storage", (event) => {
  if (event.key === cartKey || event.key === null) {
    loadCart();
    clearCheckoutStatus();
    renderCart();
  }
});
