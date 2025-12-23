var prixTotal = 0;
// =================================================================
// SCRIPT-PAYMENT.JS - GESTION DU FLUX DE PAIEMENT
// =================================================================

// État global pour les données
let allPredicationsData = [];

// Fonction pour récupérer l'ID de la prédication depuis l'URL (ex: ?sermon=3)
function getSermonIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    // On suppose que le paramètre est 'sermon'
    return parseInt(params.get('sermon'));
}

// Fonction pour afficher les détails du sermon dans le résumé de commande
function displayOrderSummary(predication) {
    const titleElement = document.getElementById('sermon-title');
    const pastorElement = document.getElementById('sermon-pastor');
    const prixElement = document.getElementById('sermon-price');
    const bntConfirmation = document.getElementById('sq-creditcard');

    if (predication) {
        titleElement.textContent = predication.Titre;
        pastorElement.textContent = predication.Pasteur;
        prixElement.textContent = predication.Prix + " €";
        bntConfirmation.textContent = `Confirmer le Paiement (${predication.Prix} €)`;
        prixTotal = predication.Prix;
    } else {
        // Afficher une erreur ou un message si la prédication est introuvable
        titleElement.textContent = "Prédication introuvable.";
        pastorElement.textContent = "Veuillez retourner au catalogue.";
        prixElement.textContent = "0,00 €";
        
        // Optionnel : Désactiver le bouton de paiement
        document.querySelector('.confirm-pay').disabled = true;
    }
}

// Fonction pour simuler la soumission du paiement
function setupPaymentSubmission() {
    const paymentForm = document.getElementById('payment-form');
    
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Empêche l'envoi classique du formulaire

            // Récupérer les informations pour la simulation
            const userName = document.getElementById('user_name').value;
            const userEmail = document.getElementById('user_email').value;
            const sermonId = getSermonIdFromUrl();
            
            // --- ÉTAPE DE VÉRIFICATION ET D'APPEL API (SIMULATION) ---
            
            console.log(`Paiement simulé pour l'utilisateur: ${userName} (${userEmail})`);
            console.log(`Prédication ID: ${sermonId}`);

            // En temps normal, ici vous appelleriez l'API de Square/Stripe, puis,
            // si l'API retourne le succès, vous redirigeriez.

            // SIMULATION DE SUCCÈS : Redirection vers la page de confirmation
            // Nous passons le nom d'utilisateur dans l'URL pour la page de succès
            window.location.href = `payment-success.html?user=${encodeURIComponent(userName)}&id=${sermonId}`;
        });
    }
}


// La fonction loadPredications est une version simplifiée ici, car nous 
// n'avons besoin que de la fonctionnalité de récupération de données CSV.
async function loadPredicationsForPayment() {
    try {
        // Le fichier de données est le même que dans le script principal
        const response = await fetch('predications_data.csv');
        if (!response.ok) {
            throw new Error('Erreur de chargement du fichier CSV.');
        }
        const csvText = await response.text();
        
        // Note: Nous réutilisons la fonction parseCSV (qui doit être copiée/déplacée
        // dans ce fichier ou dans un fichier de "librairie" commun pour fonctionner
        // correctement, car elle n'est pas définie ici). 
        // Par simplicité, je l'inclus ci-dessous.
        const parsedData = parseCSV(csvText); 
        
        const currentSermonId = getSermonIdFromUrl();
        const predication = parsedData.find(p => p.Numero === currentSermonId);

        displayOrderSummary(predication);
        setupPaymentSubmission();

    } catch (error) {
        console.error("Erreur lors du chargement des données de la commande :", error);
        // Afficher un message d'erreur si le chargement échoue
        document.getElementById('sermon-title').textContent = "Erreur de connexion aux données.";
    }
}

// --- COPIE DE LA FONCTION parseCSV DU FICHIER SCRIPT.JS (NÉCESSAIRE POUR L'AUTONOMIE) ---
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
            entry.Numero = parseInt(entry.Numero);
            data.push(entry);
        }
    }
    return data;
}
// --- FIN COPIE parseCSV ---


// Démarrer le chargement des données
document.addEventListener('DOMContentLoaded', loadPredicationsForPayment);



//Payement en ligne
// L'ID de l'application Square. À remplacer par votre ID de test/production !
const appId = 'sandbox-sq0idb-8QoWQMoLy6sw23sgPr8QDw'; 
// L'emplacement où le paiement est traité (peut être l'ID de votre entreprise Square)
const locationId = 'EAAAl3YuN5WuMLk9BEWsc5_x_FwXJz1OCh1Be88gy16zHXOvir3q6LfpvEYZG4Nw'; 
//le prix total
prixTotal = 5;

async function initializeCard(payments) {
    const card = await payments.card();
    await card.attach('#card-container');

    return card;
}

async function createPayment(token, verificationToken) {
    const body = JSON.stringify({
        locationId,
        sourceId: token,
        verificationToken,
        idempotencyKey: window.crypto.randomUUID(),
    });

    const paymentResponse = await fetch('/payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body,
    });

    if (paymentResponse.ok) {
        return paymentResponse.json();
    }

    const errorBody = await paymentResponse.text();
    throw new Error(errorBody);
}

async function tokenize(paymentMethod) {
    const tokenResult = await paymentMethod.tokenize();
    if (tokenResult.status === 'OK') {
        return tokenResult.token;
    } else {
        let errorMessage = `Tokenization failed with status: ${tokenResult.status}`;
        if (tokenResult.errors) {
            errorMessage += ` and errors: ${JSON.stringify(
            tokenResult.errors,
            )}`;
        }

        throw new Error(errorMessage);
    }
}

// Required in SCA Mandated Regions: Learn more at https://developer.squareup.com/docs/sca-overvie 
async function verifyBuyer(payments, token) {
    const verificationDetails = {
        amount: prixTotal,
        billingContact: {
            prenom : "David" //Les information du clien
        },
        currencyCode: 'USD',
        intent: 'CHARGE',
    };

    const verificationResults = await payments.verifyBuyer(
        token,
        verificationDetails,
    );
    return verificationResults.token;
}

// status is either SUCCESS or FAILURE;
function displayPaymentResults(status) {
    const statusContainer = document.getElementById(
    'payment-status-container',
    );
    if (status === 'SUCCESS') {
        statusContainer.classList.remove('is-failure');
        statusContainer.classList.add('is-success');
        // Pour simuler la prochaine étape, nous allons rediriger ici :
        window.location.href = 'payment-success.html';
    } else {
        statusContainer.classList.remove('is-success');
        statusContainer.classList.add('is-failure');
    }

    statusContainer.style.visibility = 'visible';
}

document.addEventListener('DOMContentLoaded', async function () {
    if (!window.Square) {
        throw new Error('Square.js failed to load properly');
    }

    let payments;
    try {
        payments = window.Square.payments(appId, locationId);
    } catch {
        const statusContainer = document.getElementById(
            'payment-status-container',
        );
        statusContainer.className = 'missing-credentials';
        statusContainer.style.visibility = 'visible';
        return;
    }

    let card;
    try {
        card = await initializeCard(payments);
    } catch (e) {
        console.error('Initializing Card failed', e);
        return;
    }

    async function handlePaymentMethodSubmission(event, card) {
        event.preventDefault();

        try {
            // disable the submit button as we await tokenization and make a payment request.
            cardButton.disabled = true;
            const token = await tokenize(card);
            const verificationToken = await verifyBuyer(payments, token);
            const paymentResults = await createPayment(
            token,
            verificationToken,
            );
            displayPaymentResults('SUCCESS');

            console.debug('Payment Success', paymentResults);
        } catch (e) {
            cardButton.disabled = false;
            displayPaymentResults('FAILURE');
            console.error(e.message);
        }
    }

    const cardButton = document.getElementById('sq-creditcard');
    cardButton.addEventListener('click', async function (event) {
        await handlePaymentMethodSubmission(event, card);
    });
});

