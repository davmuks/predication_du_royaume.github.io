// =================================================================
// SCRIPT-SUCCESS.JS - LOGIQUE D'AFFICHAGE ET DE CONFIRMATION EMAIL
// =================================================================

// Note: En JavaScript front-end (navigateur), vous ne pouvez PAS
// envoyer directement un e-mail pour des raisons de sécurité. 
// Ce script SIMULE l'envoi et gère l'affichage des informations de l'utilisateur.

// Nous réutilisons la fonction parseCSV pour obtenir les détails du sermon
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
// --- FIN parseCSV ---


// Fonction simulant l'envoi d'e-mail
function sendConfirmationEmail(userEmail, sermonTitle) {
    const emailStatusElement = document.getElementById('email-status');
    
    // --- SIMULATION D'APPEL SERVEUR ---
    
    emailStatusElement.style.color = 'orange';
    emailStatusElement.textContent = `Envoi de l'e-mail de confirmation à ${userEmail}...`;

    // Après un court délai (simule le temps d'attente de l'API d'envoi d'e-mail)
    setTimeout(() => {
        emailStatusElement.style.color = var(--color-success);
        emailStatusElement.textContent = `L'e-mail de confirmation pour "${sermonTitle}" a été envoyé avec succès à ${userEmail} !`;
        console.log(`E-mail de confirmation envoyé à ${userEmail} pour la prédication: ${sermonTitle}`);
    }, 2500); // Délai de 2.5 secondes
}

// Fonction principale pour afficher les détails et déclencher l'email
async function displaySuccessDetails() {
    const params = new URLSearchParams(window.location.search);
    const userName = params.get('user');
    const sermonId = params.get('id');

    if (!userName || !sermonId) {
        document.getElementById('success-message').textContent = "Erreur de Transaction.";
        document.getElementById('email-status').textContent = "Données de commande incomplètes.";
        return;
    }

    // Chargement des données CSV pour récupérer le titre et l'email (simulé)
    try {
        const response = await fetch('predications_data.csv');
        const csvText = await response.text();
        const parsedData = parseCSV(csvText); 
        
        const predication = parsedData.find(p => p.Numero === parseInt(sermonId));

        // Note : L'email de l'utilisateur n'a pas été passé de paiement.html. 
        // Nous allons SIMULER l'email ici (dans un vrai cas, il serait passé)
        const userEmail = "client@exemple.com"; 

        if (predication) {
            document.getElementById('success-message').textContent = `Félicitations, ${decodeURIComponent(userName)} !`;
            document.getElementById('order-details-title').innerHTML = `Prédication : <strong>${predication.Titre}</strong>`;
            document.getElementById('order-details-email').innerHTML = `E-mail de destination : <strong>${userEmail}</strong>`;
            
            // Mettre à jour le lien de téléchargement direct
            document.getElementById('direct-download-link').href = `download/predication_${sermonId}.pdf`; 
            
            // 🚨 Déclenchement de l'envoi d'e-mail SIMULÉ
            sendConfirmationEmail(userEmail, predication.Titre);
        } else {
             document.getElementById('success-message').textContent = "Transaction Réussie, mais Détail Introuvable.";
        }

    } catch (error) {
        console.error("Erreur de chargement des données de la prédication:", error);
    }
}


// Lancer la fonction au chargement
document.addEventListener('DOMContentLoaded', displaySuccessDetails);