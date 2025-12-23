
// =================================================================
// SCRIPT.JS - CHARGEMENT, PAGINATION ET RECHERCHE DES PRÉDICATIONS
// =================================================================

// --- État Global et Constantes ---
const PREDICATIONS_PER_PAGE = 9;
let allPredicationsData = [];
let currentPage = 1;

// --- Fonctions Utilitaires (parseCSV et createPredicationCard restent inchangées) ---

// Fonction pour parser le CSV
function parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(header => header.trim());
    const data = [];
    
    const csvRegex = /("([^"]*)"|[^,]+),?/g; 

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const values = [];
        let match;
        
        while (match = csvRegex.exec(line)) {
            const value = match[2] !== undefined ? match[2].trim() : match[1].replace(/,$/, '').trim();
            values.push(value.replace(/""/g, '"'));
        }

        const entry = {};
        headers.forEach((header, index) => {
            if (values[index] !== undefined) {
                entry[header] = values[index];
            }
        });
        
        if (entry.Titre) {
            // Convertir Numero en nombre pour une recherche facile
            entry.Numero = parseInt(entry.Numero);
            data.push(entry);
        }
    }
    return data;
}

// Fonction pour créer l'élément HTML d'une carte de prédication
function createPredicationCard(predication) {
    const card = document.createElement('article');
    card.className = 'predication-card';
    
    // Utilise l'ID pour le lien
    const detailLink = 'predication-detail.html?id=' + predication.Numero; 

    card.innerHTML = `
        <h3>${predication.Titre}</h3>
        <p class="pastor-name">${predication.Pasteur}</p>
        <p class="summary">${predication.Resume}</p>
        <a href="${detailLink}" class="cta-button">Lire la suite</a>
    `;
    return card;
}


// --- Logique de Détail de la Prédication ---

function displayPredicationDetail() {
    const container = document.getElementById('predication-detail-container');
    const params = new URLSearchParams(window.location.search);
    const predicationId = params.get('id');

    if (!container) return;
    
    // Trouver la prédication dans le tableau complet (en comparant le champ Numero)
    const predication = allPredicationsData.find(p => p.Numero === parseInt(predicationId));

    if (predication) {
        // Mettre à jour le titre de la page
        document.getElementById('page-title').textContent = `${predication.Titre} - Prédication du Royaume`;

        container.innerHTML = `
            <div class="detail-header">
                <h1>${predication.Titre}</h1>
                <p class="pastor-info">Prêché par : <strong>${predication.Pasteur}</strong> | Publié le : ${predication.Date}</p>
            </div>
            
            <section class="full-summary">
                <h2>Résumé et Impact</h2>
                <p>
                    ${predication.Resume}
                    <br><br>
                </p>
            </section>
        
            <section class="full-summary">
                <h2>La prédication complete</h2>
                <div class="half-iframe" >
                    <iframe src="Predications/${predication.Numero}.htm"></iframe>
                </div>
            </section>

            <section class="purchase-container">
                <h3>Soutenez notre Ministère</h3>
                <p>Pour soutenir la diffusion de la Parole et télécharger la version PDF complète de ce message :</p>
                <a href="paiement.html?sermon=${predication.Numero}" class="cta-button">Télécharger (${predication.Prix} €)</a>
            </section>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="predications.html" class="cta-button secondary">Retour à toutes les Prédications</a>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <h1 style="color: var(--color-primary);">Prédication Non Trouvée (Erreur 404)</h1>
                <p>Désolé, l'identifiant de la prédication (ID: ${predicationId}) est invalide ou cette prédication n'existe plus.</p>
                <a href="predications.html" class="cta-button" style="margin-top: 20px;">Voir le catalogue complet</a>
            </div>
        `;
    }
}


// --- Fonctions de Pagination et Recherche (Inchangées) ---

function renderPredications(data, page) {
    // ... (Logique de rendu et de mise à jour des boutons inchangée) ...
    const allPredicationsContainer = document.querySelector('.all-predications-list');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pageStatus = document.getElementById('page-status');
    
    if (!allPredicationsContainer) return; 

    // Gère le cas où la recherche renvoie 0 résultat
    if (data.length === 0) {
        allPredicationsContainer.innerHTML = '<p style="text-align:center; padding: 40px;">Aucune prédication trouvée correspondant à votre recherche.</p>';
        if (pageStatus) pageStatus.textContent = '0 résultat';
        if (prevBtn) prevBtn.disabled = true;
        if (nextBtn) nextBtn.disabled = true;
        return;
    }


    const totalPages = Math.ceil(data.length / PREDICATIONS_PER_PAGE);
    
    const start = (page - 1) * PREDICATIONS_PER_PAGE;
    const end = start + PREDICATIONS_PER_PAGE;
    
    const pageData = data.slice(start, end);
    
    allPredicationsContainer.innerHTML = '';
    pageData.forEach(predication => {
        allPredicationsContainer.appendChild(createPredicationCard(predication));
    });
    
    if (prevBtn) {
        prevBtn.disabled = page === 1;
    }
    if (nextBtn) {
        nextBtn.disabled = page === totalPages;
    }
    if (pageStatus) {
        pageStatus.textContent = `Page ${page} sur ${totalPages} (${data.length} résultats)`;
    }
}

function setupPaginationListeners() {
    // ... (Logique des écouteurs de pagination inchangée) ...
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    const dataToUse = getFilteredData();
    const totalPages = Math.ceil(dataToUse.length / PREDICATIONS_PER_PAGE);

    if (nextBtn) {
        nextBtn.onclick = () => { // Remplacement par onclick pour éviter les doubles écouteurs
            if (currentPage < totalPages) {
                currentPage++;
                renderPredications(dataToUse, currentPage);
            }
        };
    }

    if (prevBtn) {
        prevBtn.onclick = () => { // Remplacement par onclick pour éviter les doubles écouteurs
            if (currentPage > 1) {
                currentPage--;
                renderPredications(dataToUse, currentPage);
            }
        };
    }
}


function filterPredications(searchText) {
    // ... (Logique de filtrage inchangée) ...
    const query = searchText.toLowerCase().trim();
    if (!query) {
        return allPredicationsData; 
    }

    return allPredicationsData.filter(predication => {
        const titleMatch = predication.Titre.toLowerCase().includes(query);
        const pastorMatch = predication.Pasteur.toLowerCase().includes(query);
        
        return titleMatch || pastorMatch;
    });
}

function setupSearchFeature() {
    // ... (Logique de recherche en temps réel inchangée) ...
    const searchInput = document.getElementById('search-input');
    const searchButton = document.querySelector('.search-bar button');
    
    // Fonction qui lance le filtrage
    const performSearch = () => {
        const filteredData = filterPredications(searchInput.value);
        currentPage = 1; // Toujours revenir à la première page après une nouvelle recherche
        renderPredications(filteredData, currentPage);
        // Réinitialiser les écouteurs de pagination avec les nouvelles données
        setupPaginationListeners(); 
    };
    
    // 1. Lancer la recherche IMMÉDIATEMENT lors de la saisie (pour la recherche en temps réel)
    if (searchInput) {
        // Cette ligne active le filtrage dès qu'une lettre est tapée
        searchInput.addEventListener('input', performSearch);
        
        // 2. Lancer la recherche lors de l'appui sur 'Entrée' (méthode de secours)
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // Empêche l'envoi du formulaire par défaut
                performSearch();
            }
        });
    }

    // 3. Lancer la recherche au clic sur le bouton (méthode manuelle)
    if (searchButton) {
        searchButton.addEventListener('click', performSearch);
    }

}

function getFilteredData() {
    // ... (Logique d'obtention des données filtrées inchangée) ...
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        return filterPredications(searchInput.value);
    }
    return allPredicationsData;
}


// --- Chargement des Données (Fonction principale mise à jour) ---

async function loadPredications() {
    try {
        const response = await fetch('predications_data.csv');
        if (!response.ok) {
            throw new Error('Erreur de chargement du fichier CSV.');
        }
        const csvText = await response.text();
        allPredicationsData = parseCSV(csvText); 

        // Détermine quelle page est chargée et exécute la fonction appropriée
        const isDetailPage = document.getElementById('predication-detail-container') !== null;
        const isCataloguePage = document.querySelector('.all-predications-list') !== null;
        const isIndexPage = document.querySelector('.predications-list') !== null;

        if (isDetailPage) {
            displayPredicationDetail();
        } 
        
        if (isCataloguePage) {
            currentPage = 1; 
            renderPredications(allPredicationsData, currentPage);
            setupPaginationListeners(); 
            setupSearchFeature(); 
        }

        if (isIndexPage) {
            const indexContainer = document.querySelector('.predications-list');
            if (indexContainer) {
                indexContainer.innerHTML = '<h2>Nos Dernières Prédications</h2>'; // Réinitialiser le titre
                const latestPredications = allPredicationsData.slice(0, 3);
                latestPredications.forEach(predication => {
                    indexContainer.appendChild(createPredicationCard(predication));
                });
                indexContainer.innerHTML += `
                    <div class="more-button" style="text-align: center; grid-column: 1 / -1; margin-top: 20px;">
                        <a href="predications.html" class="cta-button secondary">Voir toutes les prédications</a>
                    </div>
                `;
            }
             // S'assurer que la barre de recherche est fonctionnelle sur index (même si elle ne filtre pas pour l'affichage initial)
            setupSearchFeature();
        }

    } catch (error) {
        console.error("Erreur lors du chargement ou de l'analyse des prédications :", error);
        // ... (gestion des erreurs) ...
    }
}

// Lancer le chargement au démarrage du DOM
document.addEventListener('DOMContentLoaded', loadPredications);
