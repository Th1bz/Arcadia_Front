let animalIdToDelete = null;
let animalIdToEdit = null;


const deleteModal = document.getElementById('deleteAnimalModal');

//--------------DELETE ANIMAL--------------
if (deleteModal) {
    // Quand le modal s'ouvre
    deleteModal.addEventListener('show.bs.modal', function(event) {
        const button = event.relatedTarget;
        animalIdToDelete = button.getAttribute('data-animal-id');
        console.log('Modal ouvert pour l\'animal ID:', animalIdToDelete);
    });

    // Gestionnaire pour le bouton de suppression
    const confirmDeleteButton = document.getElementById('confirmDeleteButton');
    
    if (confirmDeleteButton) {
        confirmDeleteButton.addEventListener('click', async function() {
            if (!animalIdToDelete) {
                console.error('ID de l\'animal manquant');
                return;
            }

            try {
                const response = await fetch(`${apiUrl}animal/delete/${animalIdToDelete}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error('Erreur lors de la suppression');
                }

                // Fermer le modal
                const modal = bootstrap.Modal.getInstance(deleteModal);
                modal.hide();

                // Rafraîchir la liste
                loadAnimals();

                // Message de succès
                alert('Animal supprimé avec succès !');

            } catch (error) {
                console.error('Erreur:', error);
                alert('Erreur lors de la suppression: ' + error.message);
            }
        });
    } else {
        console.error('Bouton de confirmation de suppression non trouvé');
    }
} else {
    console.error('Modal de suppression non trouvé');
}
//------------------------------------------




//--------------EDIT ANIMAL-------------- 
const editModal = document.getElementById('editAnimalModal');

if (editModal) {
    // Quand le modal s'ouvre
    editModal.addEventListener('show.bs.modal', function(event) {
        const button = event.relatedTarget;
        animalIdToEdit = button.getAttribute('data-animal-id');
        console.log('Modal ouvert pour éditer l\'animal ID:', animalIdToEdit);

        // Récupérer les données de l'animal
        fetch(`${apiUrl}animal/${animalIdToEdit}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des données');
                }
                return response.json();
            })
            .then(animal => {
                console.log('Données de l\'animal récupérées:', animal);
                
                // Remplir le formulaire
                document.getElementById('editAnimalId').value = animal.id;
                document.getElementById('editNameInput').value = animal.firstName;
                document.getElementById('editRaceInput').value = animal.race.id;
                document.getElementById('editStatusInput').value = animal.status;
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des données:', error);
                alert('Erreur lors de la récupération des données de l\'animal');
            });
    });

    const editForm = document.getElementById('formEditAnimal');
    if (editForm) {
        editForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Soumission du formulaire d\'édition');

            try {
                const formData = new FormData(this);
                const animalData = {
                    firstName: formData.get('firstName'),
                    race: parseInt(formData.get('race')),
                    status: formData.get('status')
                };

                // Gestion de la photo
                const pictureFile = formData.get('picture');
                if (pictureFile && pictureFile.size > 0) {
                    console.log('Nouvelle image détectée');
                    const base64Picture = await convertFileToBase64(pictureFile);
                    animalData.pictureData = base64Picture;
                }

                const response = await fetch(`${apiUrl}animal/edit/${animalIdToEdit}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(animalData)
                });

                if (!response.ok) {
                    throw new Error(`Erreur HTTP: ${response.status}`);
                }

                // Fermer le modal
                const modal = bootstrap.Modal.getInstance(editModal);
                modal.hide();

                // Rafraîchir la liste
                await loadAnimals();

                // Message de succès
                alert('Animal modifié avec succès !');

            } catch (error) {
                console.error('Erreur lors de la modification:', error);
                alert('Erreur lors de la modification: ' + error.message);
            }
        });
    }
}
//------------------------------------------  






//--------------Fonction pour générer le HTML d'une section habitat--------------@
function generateHabitatSection(habitat) {
    const imageUrl = habitat.pictures && habitat.pictures.length > 0 
        ? `http://127.0.0.1:8000${habitat.pictures[0].path}`
        : '../Images/Zoo/mediumBrownArcadia.png';

    return `
    <article class="article-bg shadow">
        <div>
            <h2 id="${habitat.name.toLowerCase()}" class="text-center font-subtitle bg-dark text-primary p-4">
                ${habitat.name}
                <button type="button" class="btn btn-outline-light text-info" data-bs-toggle="modal"
                    data-bs-target="#EditionHabitatModal" data-habitat-id="${habitat.id}" data-show="2" data-show="1">
                    <i class="bi bi-pencil-square"></i>
                </button>
            </h2>

            <div class="descritpion-habitat container">
                <a class="m-0" data-bs-toggle="collapse" href="#collapse${habitat.id}" role="button" aria-expanded="false"
                    aria-controls="collapse${habitat.id}">
                    <img src="${imageUrl}"
                        class="d-block w-100 object-fit-cover img-cover-bottom shadow rounded" 
                        style="height: 350px"
                        alt="${habitat.name}" 
                        onerror="this.src='../Images/Zoo/mediumBrownArcadia.png'"/>
                    <h3 class="text-center m-2 mb-0 pb-4">
                        <i class="bi bi-arrow-down-square"></i> Développer
                        <i class="bi bi-arrow-up-square"></i>
                    </h3>
                </a>
            </div>

            <div class="collapse" id="collapse${habitat.id}">
                <div class="m-4">
                    <div class="d-flex justify-content-center" data-show="1">
                        <button type="button" data-bs-toggle="modal" data-bs-target="#addAnimalModal" class="btn btn-secondary m-3">
                            Ajouter un Animal
                        </button>
                    </div>
                    <div class="container d-flex justify-content-center text-justify text-primary">
                        <p>${habitat.description || 'Description non disponible'}</p>
                    </div>
                    
                    <div class="d-flex flex-row justify-content-evenly flex-wrap p-4" id="addCard${habitat.id}Animal">
                    </div>
                </div>
            </div>
        </div>
    </article>`;
}

// Modifier la fonction loadHabitats existante
function loadHabitats() {
    console.log('Début du chargement des habitats');
    
    fetch(apiUrl + "habitat/list")
        .then(response => {
            if (!response.ok) throw new Error('Erreur réseau: ' + response.status);
            return response.json();
        })
        .then(habitats => {
            console.log('Habitats reçus:', habitats);
            const habitatContainer = document.getElementById('habitat-container');
            if (!habitatContainer) throw new Error('Container habitat-container non trouvé');

            habitatContainer.innerHTML = '';
            habitats.forEach(habitat => {
                console.log('Traitement habitat:', habitat);
                const section = generateHabitatSection(habitat);
                habitatContainer.insertAdjacentHTML('beforeend', section);
            });
            
            showAndHideElementsForRole();
        })
        .catch(error => {
            console.error('Erreur:', error);
            console.error('Stack trace:', error.stack);
        });
}
//------------------------------------------





//--------------Fonction pour générer le HTML d'une card animal-------------- 
function generateAnimalCard(animal) {
    // Déterminer l'URL de l'image
    let imageUrl;

    if (animal.picture && animal.picture.url) {
        imageUrl = `http://127.0.0.1:8000${animal.picture.url}`;
    } else {
        imageUrl = '../Images/Savane/lion.jpg';           
    }

    const card = `
        <div class="image-card card p-0 m-4 shadow rounded-4" style="width: 15rem">
            <img src="${imageUrl}" 
                 class="card-img-top object-fit-cover img-card-h rounded-top-4" 
                 alt="${animal.firstName}" />
            <h5 class="card-title font-subtitle text-center text-secondary bg-dark">
                ${animal.firstName}
            </h5>
            <div class="action-image-buttons">
                <button type="button" class="btn btn-outline-light text-info" 
                        data-bs-toggle="modal" 
                        data-bs-target="#editAnimalModal" 
                        data-animal-id="${animal.id}" 
                        data-show="connected">
                    <i class="bi bi-pencil-square"></i>
                </button>
                <button type="button" class="btn btn-outline-light text-danger" 
                        data-bs-toggle="modal" 
                        data-bs-target="#deleteAnimalModal" 
                        data-animal-id="${animal.id}" 
                        data-show="1">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
            <div class="card-body">
                <ul class="card-text list-group-flush p-0">
                    <li class="list-group-item"><strong>Race : </strong>${animal.race.label}</li>
                    <li class="list-group-item"><strong>Santé : </strong>${animal.status}</li>
                </ul>
            </div>
        </div>
    `;
    
    return card;
}
//------------------------------------------


//--------------Fonction pour charger et afficher tous les animaux--------------
function loadAnimals() {
    fetch(apiUrl + "animal/list")
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur réseau: ' + response.status);
            }
            return response.json();
        })
        .then(animals => {
            console.log('Animaux reçus:', animals);
            
            // Créer un objet pour stocker les conteneurs par habitat
            const habitatGalleries = {};
            
            // Vider et initialiser tous les conteneurs d'habitat
            animals.forEach(animal => {
                const habitatId = animal.habitat.id;
                const galleryId = `addCard${habitatId}Animal`;
                
                if (!habitatGalleries[habitatId]) {
                    const gallery = document.getElementById(galleryId);
                    if (gallery) {
                        gallery.innerHTML = ''; // Vider le conteneur
                        habitatGalleries[habitatId] = gallery;
                    }
                }
            });

            // Afficher les animaux
            animals.forEach(animal => {
                const card = generateAnimalCard(animal);
                const habitatId = animal.habitat.id;
                const gallery = habitatGalleries[habitatId];
                
                if (gallery) {
                    gallery.insertAdjacentHTML('beforeend', card);
                } else {
                    console.warn(`Conteneur non trouvé pour l'habitat ID: ${habitatId}`);
                }
            });
            
            showAndHideElementsForRole();
        })
        .catch(error => {
            console.error('Erreur lors du chargement des animaux:', error);
        });
}
//------------------------------------------


//--------------Fonction pour initialiser le formulaire d'ajout--------------
function initializeAddForm() {

    const addForm = document.getElementById('formAddAnimal');
    if (addForm) {
        addForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // Empêche le rechargement de la page
            console.log('Soumission du formulaire');

            const formData = new FormData(this);
            const pictureFile = formData.get('Image');

            // Préparer les données de l'animal
            const animalData = {
                firstName: formData.get('firstName'),
                race: parseInt(formData.get('race')),
                habitat: parseInt(formData.get('habitat')),
                status: formData.get('status')
            };

            // Si une image est sélectionnée
            if (pictureFile && pictureFile.size > 0) {
                try {
                    const base64Picture = await convertFileToBase64(pictureFile);
                    animalData.pictureData = base64Picture;
                } catch (error) {
                    console.error('Erreur image:', error);
                    alert('Erreur lors du traitement de l\'image');
                    return;
                }
            }

            try {
                const response = await fetch(apiUrl + 'animal/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(animalData)
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => null);
                    console.error('Erreur détaillée:', errorData);
                    throw new Error(`Erreur ${response.status}: ${errorData?.message || response.statusText}`);
                }

                const result = await response.json();

                // Fermer le modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('addAnimalModal'));
                modal.hide();

                // Rafraîchir la liste
                loadAnimals();

                // Message de succès
                alert('Animal créé avec succès !');
                
                // Réinitialiser le formulaire
                this.reset();

            } catch (error) {
                console.error('Erreur complète:', error);
                alert('Erreur lors de la création: ' + error.message);
            }
        });
    } else {
        console.error('Formulaire non trouvé');
    }
}
//------------------------------------------


//--------------Fonction pour convertir un fichier en base64--------------
function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}
//------------------------------------------

//--------------Fonction pour remplir le select habitat--------------
function listHabitatsSelect() {
    fetch(apiUrl + "habitat/list")
        .then(response => {
            if (!response.ok) throw new Error('Erreur réseau: ' + response.status);
            return response.json();
        })
        .then(habitats => {
            const select = document.getElementById('habitatAnimalSelect');
            if (!select) return;

            // Garder l'option par défaut
            const defaultOption = select.querySelector('option[value=""]');
            select.innerHTML = '';
            if (defaultOption) select.appendChild(defaultOption);

            // Ajouter les options pour chaque habitat
            habitats.forEach(habitat => {
                const option = document.createElement('option');
                option.value = habitat.id;
                option.textContent = habitat.name;
                select.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Erreur lors du chargement des habitats:', error);
        });
}
//------------------------------------------


//--------------Fonction pour charger le script-------------- 
(function() {
    if (typeof loadAnimals === 'undefined') {
        console.error('Le fichier animal.js n\'est pas chargé correctement');
        return;
    }
    
    // Si le DOM est déjà chargé
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        loadAnimals();
        loadHabitats();
        initializeAddForm();
        listHabitatsSelect();
    } else {
        // Sinon attendre le chargement du DOM
        document.addEventListener('DOMContentLoaded', () => {
            loadAnimals();
            loadHabitats();
            initializeAddForm();
            listHabitatsSelect();
        });
    }
})();
//------------------------------------------  

