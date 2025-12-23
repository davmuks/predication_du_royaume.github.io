document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('email_form');
    
    if (form) {
        // IDs de vos configurations EmailJS (à remplacer)
        
        const serviceID = 'service_tq1vr5w'; 
        const templateID = 'VOTRE_TEMPLATE_ID'; 

        // Récupérer les données pour s'assurer que l'email est prêt
        const toEmail = document.getElementById('to_email_input').value;
        const sermonTitle = document.getElementById('sermon_title_input').value;

        // Une simple vérification pour s'assurer que nous avons une adresse email et un titre
        if (toEmail && sermonTitle) {
            
            console.log(`Tentative d'envoi d'e-mail à ${toEmail} pour le reçu...`);

            // Envoyer l'e-mail
            emailjs.sendForm(serviceID, templateID, form)
                .then((response) => {
                   console.log('E-mail de confirmation envoyé avec succès !', response.status, response.text);
                   // Vous pouvez mettre à jour l'interface utilisateur ici si vous voulez
                }, (err) => {
                   console.error('Échec de l\'envoi de l\'e-mail :', err);
                   // Gérer l'échec d'envoi ici (ex: afficher un message)
                });
        }
    }
});