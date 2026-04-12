/**
 * Project Yaro - 10% Blueprint
 * Скрипт для управления модальным окном оплаты Whop
 */

function buyProduct() {
    const modal = document.getElementById("checkoutModal");
    modal.style.display = "block";
    // Блокируем скролл основной страницы, чтобы не дергалась
    document.body.style.overflow = "hidden";
}

function closeModal() {
    const modal = document.getElementById("checkoutModal");
    modal.style.display = "none";
    // Возвращаем скролл основной страницы
    document.body.style.overflow = "auto";
}

// Закрываем окно, если пользователь кликнул на темную область вокруг формы
window.onclick = function(event) {
    const modal = document.getElementById("checkoutModal");
    const overlay = document.querySelector(".modal-overlay");
    if (event.target === modal || event.target === overlay) {
        closeModal();
    }
}