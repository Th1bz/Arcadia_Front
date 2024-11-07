
//--------------Fonction pour générer le HTML d'une card habitat--------------
function generateHabitatCard(habitat) {
    let description = habitat.description.replace(/\n/g, '<br>');
  description = description.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    let imageUrl = '../Images/Zoo/mediumBrownArcadia.png';

    if (habitat.pictures && habitat.pictures.length > 0) {
        imageUrl = `${apiUrl}${habitat.pictures[0].path}`;
    }

    const card = `
        
        <div class="card p-0 m-4 shadow rounded-4 img-zoom-container" style="width: 15rem">
            <a href="/habitat" class="text-decoration-none">
                <img src="${imageUrl}" 
                    class="card-img-top img-card-h rounded-top-4 shadow" 
                    alt="${habitat.name}"
                    onerror="this.src='../Images/Zoo/mediumBrownArcadia.png'" />
            </a>
                <h5 class="card-title font-subtitle text-center text-secondary bg-dark mb-0">
                    ${habitat.name}
                </h5>
                <div class="card-body" style="height: 150px; overflow-y: auto;">
                    <p class="card-text">${description}</p>
                </div>
        </div>
    `;
    
    return card;
}

//--------------Fonction pour charger et afficher tous les habitats--------------
function loadHabitats() {
    console.log('Début du chargement des habitats');
    
    fetch(apiUrl + "habitat/list")
        .then(response => {
            if (!response.ok) throw new Error('Erreur réseau: ' + response.status);
            return response.json();
        })
        .then(habitats => {
            console.log('Habitats reçus:', habitats);
            const habitatGallery = document.getElementById('addCardHabitat');
            if (!habitatGallery) throw new Error('Container addCardHabitat non trouvé');

            habitatGallery.innerHTML = '';
            habitats.forEach(habitat => {
                const card = generateHabitatCard(habitat);
                habitatGallery.insertAdjacentHTML('beforeend', card);
            });
            
            showAndHideElementsForRole();
        })
        .catch(error => {
            console.error('Erreur:', error);
            console.error('Stack trace:', error.stack);
        });
}





//--------------Initialisation--------------
(function() {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        loadHabitats();
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            loadHabitats();
        });
    }
})();

