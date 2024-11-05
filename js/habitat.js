let habitatIdToDelete = null;
let habitatIdToEdit = null;

//--------------DELETE HABITAT--------------
const deleteModal = document.getElementById('deleteHabitatModal');

if (deleteModal) {
    deleteModal.addEventListener('show.bs.modal', function(event) {
        const button = event.relatedTarget;
        habitatIdToDelete = button.getAttribute('data-habitat-id');
        console.log('Modal ouvert pour l\'habitat ID:', habitatIdToDelete);
    });

    const habitatDeleteButton = document.getElementById('habitatDeleteButton');
    if (habitatDeleteButton) {
        habitatDeleteButton.addEventListener('click', async function() {
            if (!habitatIdToDelete) {
                console.error('ID de l\'habitat manquant');
                return;
            }

            try {
                const response = await fetch(`${apiUrl}habitat/delete/${habitatIdToDelete}`, {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Erreur lors de la suppression');
                }

                const modal = bootstrap.Modal.getInstance(deleteModal);
                modal.hide();
                loadHabitats();
                alert('Habitat supprimé avec succès !');

            } catch (error) {
                console.error('Erreur:', error);
                alert('Erreur lors de la suppression: ' + error.message);
            }
        });
    }
}

//--------------EDIT HABITAT--------------
const editModal = document.getElementById('editHabitatModal');

if (editModal) {
    editModal.addEventListener('show.bs.modal', function(event) {
        const button = event.relatedTarget;
        habitatIdToEdit = button.getAttribute('data-habitat-id');
        console.log('Modal ouvert pour éditer l\'habitat ID:', habitatIdToEdit);

        fetch(`${apiUrl}habitat/${habitatIdToEdit}`)
            .then(response => {
                if (!response.ok) throw new Error('Erreur lors de la récupération des données');
                return response.json();
            })
            .then(habitat => {
                console.log('Données de l\'habitat récupérées:', habitat);
                document.getElementById('editHabitatId').value = habitat.id;
                document.getElementById('editNameInput').value = habitat.name;
                document.getElementById('editDescriptionInput').value = habitat.description;
            })
            .catch(error => {
                console.error('Erreur:', error);
                alert('Erreur lors de la récupération des données de l\'habitat');
            });
    });

    const editForm = document.getElementById('editHabitatForm');
    if (editForm) {
        editForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Soumission du formulaire d\'édition');

            try {
                const formData = new FormData(this);
                const habitatData = {
                    name: formData.get('name'),
                    description: formData.get('description')
                };

                const pictureFile = formData.get('Image');
                if (pictureFile && pictureFile.size > 0) {
                    console.log('Nouvelle image détectée');
                    const base64Picture = await convertFileToBase64(pictureFile);
                    habitatData.pictureData = base64Picture;
                }

                const response = await fetch(`${apiUrl}habitat/edit/${habitatIdToEdit}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(habitatData)
                });

                if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

                const modal = bootstrap.Modal.getInstance(editModal);
                modal.hide();
                await loadHabitats();
                alert('Habitat modifié avec succès !');

            } catch (error) {
                console.error('Erreur:', error);
                alert('Erreur lors de la modification: ' + error.message);
            }
        });
    }
}

//--------------Fonction pour générer le HTML d'une card habitat--------------
function generateHabitatCard(habitat) {
    console.log('Traitement habitat:', habitat);
    let imageUrl = '../Images/Zoo/mediumBrownArcadia.png';

    if (habitat.pictures && habitat.pictures.length > 0) {
        imageUrl = `http://127.0.0.1:8000${habitat.pictures[0].path}`;
        console.log('URL de l\'image construite:', imageUrl);
    }

    const card = `
        <div class="text-decoration-none">
            <div class="card p-0 m-4 shadow rounded-4" style="width: 15rem">
                <img src="${imageUrl}" 
                     class="card-img-top img-card-h rounded-top-4" 
                     alt="${habitat.name}"
                     onerror="this.src='../Images/Zoo/mediumBrownArcadia.png'" />
                <h5 class="card-title font-subtitle text-center text-secondary bg-dark">
                <button type="button" class="btn btn-outline-light text-danger  edit-card-home" 
                            data-bs-toggle="modal"
                            data-bs-target="#deleteHabitatModal" 
                            data-habitat-id="${habitat.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                    ${habitat.name}
                    <button type="button" class="btn btn-outline-light text-info edit-card-home" 
                            data-bs-toggle="modal"
                            data-bs-target="#editHabitatModal" 
                            data-habitat-id="${habitat.id}">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    
                </h5>
                <div class="card-body">
                    <p class="card-text">${habitat.description}</p>
                </div>
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
                console.log('Traitement habitat:', habitat);
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

//--------------Fonction pour convertir un fichier en base64--------------
function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

//--------------Fonction pour initialiser le formulaire d'ajout--------------
function initializeAddHabitatForm() {
    const addForm = document.getElementById('addHabitatForm');
    if (addForm) {
        addForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Soumission du formulaire');

            try {
                const formData = new FormData(this);
                const habitatData = {
                    name: formData.get('name'),
                    description: formData.get('description')
                };

                const pictureFile = formData.get('Image');
                if (pictureFile && pictureFile.size > 0) {
                    const base64Picture = await convertFileToBase64(pictureFile);
                    habitatData.pictureData = base64Picture;
                }

                const response = await fetch(apiUrl + 'habitat/new', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(habitatData)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Erreur lors de la création');
                }

                const modal = bootstrap.Modal.getInstance(document.getElementById('addHabitatModal'));
                modal.hide();
                loadHabitats();
                alert('Habitat créé avec succès !');
                this.reset();

            } catch (error) {
                console.error('Erreur:', error);
                alert(error.message);
            }
        });
    }
}

//--------------Initialisation--------------
(function() {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        loadHabitats();
        initializeAddHabitatForm();
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            loadHabitats();
            initializeAddHabitatForm();
        });
    }
})();
