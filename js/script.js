function buyProduct() {
    const modal = document.getElementById("checkoutModal");
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
}

function closeModal() {
    const modal = document.getElementById("checkoutModal");
    modal.style.display = "none";
    document.body.style.overflow = "auto";
}

window.onclick = function(event) {
    const modal = document.getElementById("checkoutModal");
    if (event.target.classList.contains('modal-overlay')) {
        closeModal();
    }
}