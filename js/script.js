// Открытие окна оплаты
function buyProduct() {
    const modal = document.getElementById("checkoutModal");
    modal.style.display = "flex";
    // Блокируем скролл основной страницы
    document.body.style.overflow = "hidden";
}

// Закрытие окна оплаты
function closeModal() {
    const modal = document.getElementById("checkoutModal");
    modal.style.display = "none";
    // Возвращаем скролл
    document.body.style.overflow = "auto";
}

// Закрытие при клике на темный фон
window.onclick = function(event) {
    const modal = document.getElementById("checkoutModal");
    if (event.target === modal) {
        closeModal();
    }
}