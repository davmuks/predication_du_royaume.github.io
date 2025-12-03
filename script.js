document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const predicationCards = document.querySelectorAll('.predication-card');

    if (searchInput) {
        // Ajout d'un écouteur d'événement sur chaque touche relâchée
        searchInput.addEventListener('keyup', (e) => {
            // Convertir la valeur de recherche en minuscules pour une recherche insensible à la casse
            const searchTerm = e.target.value.toLowerCase();

            // Parcourir toutes les cartes de prédication
            predicationCards.forEach(card => {
                // Récupérer le titre et le nom du pasteur de la carte
                const title = card.querySelector('h3').textContent.toLowerCase();
                const pastor = card.querySelector('.pastor-name').textContent.toLowerCase();

                // Vérifier si le terme de recherche est inclus dans le titre OU dans le nom du pasteur
                if (title.includes(searchTerm) || pastor.includes(searchTerm)) {
                    // Afficher la carte si elle correspond
                    card.style.display = 'block';
                } else {
                    // Masquer la carte si elle ne correspond pas
                    card.style.display = 'none';
                }
            });
        });
    }
});
