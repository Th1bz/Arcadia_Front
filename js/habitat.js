let animalIdToDelete = null;
let animalIdToEdit = null;


const deleteModal = document.getElementById('DeleteCardModal');

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
const editModal = document.getElementById('EditionCardModal');

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
} else {
    console.error('Modal d\'édition non trouvé');
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
                        data-bs-target="#EditionCardModal" 
                        data-animal-id="${animal.id}" 
                        data-show="connected">
                    <i class="bi bi-pencil-square"></i>
                </button>
                <button type="button" class="btn btn-outline-light text-danger" 
                        data-bs-toggle="modal" 
                        data-bs-target="#DeleteCardModal" 
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
            
            // Récupérer les conteneurs
            const savaneGallery = document.getElementById('addCardSavaneAnimal');
            const jungleGallery = document.getElementById('addCardJungleAnimal');
            const maraisGallery = document.getElementById('addCardMaraisAnimal');

            // Vider les conteneurs
            savaneGallery.innerHTML = '';
            jungleGallery.innerHTML = '';
            maraisGallery.innerHTML = '';

            // Afficher les animaux
            animals.forEach(animal => {
                const card = generateAnimalCard(animal);
                
                // Ajouter la carte dans le bon conteneur selon l'habitat
                switch(animal.habitat.id) {
                    case 1: // Savane
                        savaneGallery.insertAdjacentHTML('beforeend', card);
                        break;
                    case 2: // Jungle
                        jungleGallery.insertAdjacentHTML('beforeend', card);
                        break;
                    case 3: // Marais
                        maraisGallery.insertAdjacentHTML('beforeend', card);
                        break;
                }
            });
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
                const modal = bootstrap.Modal.getInstance(document.getElementById('addCardModal'));
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



//--------------Fonction pour charger le script-------------- 
(function() {
    if (typeof loadAnimals === 'undefined') {
        console.error('Le fichier habitat.js n\'est pas chargé correctement');
        return;
    }
    
    // Si le DOM est déjà chargé
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        loadAnimals();
        initializeAddForm(); // Initialiser le formulaire
    } else {
        // Sinon attendre le chargement du DOM
        document.addEventListener('DOMContentLoaded', () => {
            loadAnimals();
            initializeAddForm(); // Initialiser le formulaire
        });
    }
})();
//------------------------------------------  

