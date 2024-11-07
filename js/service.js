let serviceIdToDelete = null;
let serviceIdToEdit = null;

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB en octets

const deleteModalService = document.getElementById('deleteServiceModal');
const editModalService = document.getElementById('editServiceModal');


//--------------DELETE SERVICE--------------

if (deleteModalService) {
    deleteModalService.addEventListener('show.bs.modal', function(event) {
        const button = event.relatedTarget;
        serviceIdToDelete = button.getAttribute('data-service-id');
    });

    const serviceDeleteButton = document.getElementById('serviceDeleteButton');
    if (serviceDeleteButton) {
        serviceDeleteButton.addEventListener('click', async function() {
            if (!serviceIdToDelete) {
                console.error('ID du service manquant');
                return;
            }

            try {
                const response = await fetch(`${apiUrl}service/delete/${serviceIdToDelete}`, {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error);
                }

                const modal = bootstrap.Modal.getInstance(deleteModalService);
                modal.hide();
                loadServices();
                alert('Service supprimé avec succès !');

            } catch (error) {
                console.error(error);
                alert(error.message);
            }
        });
    }
}
//---------------------------------------

//--------------EDIT HABITAT--------------

if (editModalService) {
    editModalService.addEventListener('show.bs.modal', function(event) {
        const button = event.relatedTarget;
        serviceIdToEdit = button.getAttribute('data-service-id');
        console.log('Modal ouvert pour éditer le service ID:', serviceIdToEdit);

        fetch(`${apiUrl}service/${serviceIdToEdit}`)
            .then(response => {
                if (!response.ok) {
                    console.error('Status:', response.status);
                    return response.text().then(text => {
                        console.error('Réponse:', text);
                        throw new Error('Erreur lors de la récupération des données');
                    });
                }
                return response.json();
            })
            .then(service => {
                console.log('Données de lu service récupérées:', service);
                document.getElementById('editServiceId').value = service.id;
                document.getElementById('editNameService').value = service.name;
                document.getElementById('editDescriptionService').value = service.description;
            })
            .catch(error => {
                console.error('Erreur détaillée:', error);
                alert('Erreur lors de la récupération des données du service');
            });
    });

    const editServiceForm = document.getElementById('editServiceForm');
    if (editServiceForm) {
        editServiceForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            try {
                const formData = new FormData(this);
                const serviceData = {
                    name: formData.get('name'),
                    description: formData.get('description')
                };

                const imageFile = formData.get('Image');
                if (imageFile && imageFile.size > 0) {
                    const base64Image = await convertFileToBase64(imageFile);
                    serviceData.pictureData = base64Image;
                }

                const response = await fetch(`${apiUrl}service/edit/${serviceIdToEdit}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(serviceData)
                });

                if (!response.ok) {
                    throw new Error('Erreur lors de la modification');
                }

                const modal = bootstrap.Modal.getInstance(editModalService);
                modal.hide();

                // Rafraîchir la liste des habitats si la fonction existe
                if (typeof loadServices === 'function') {
                    loadServices();
                }
                
                alert('Service modifié avec succès !');

            } catch (error) {
                console.error('Erreur:', error);
                alert('Erreur lors de la modification du service');
            }
        });
    }
}
//-------------------------------------------

//--------------Fonction pour générer le HTML d'un Article Service--------------
function generateServiceSection(service) {

  // Remplacer les retours à la ligne par des balises <br>
  let description = service.description.replace(/\n/g, '<br>');
  description = description.replace(/\*\*(.*?)\*\*/g, '<strong class="text-important-textarea">$1</strong>');
    const imageUrl =
      service.pictures && service.pictures.length > 0
        ? `${apiUrl}${service.pictures[0].path}`
        : "../Images/Zoo/mediumBrownArcadia.png";
  
    return `
  <article class="article-bg shadow">
    <div>
      <h2 id="${service.name}" class="text-center font-subtitle bg-dark title-sub-section p-4">
        <button type="button" class="btn btn-outline-light text-danger" data-bs-toggle="modal"
          data-bs-target="#deleteServiceModal" data-service-id="${service.id}" data-show="1"><i class="bi bi-trash"></i>
        </button>
        ${service.name}
        <button type="button" class="btn btn-outline-light text-info" data-bs-toggle="modal"
          data-bs-target="#editServiceModal" data-service-id="${service.id}" data-show="3" data-show="1">
          <i class="bi bi-pencil-square"></i>
        </button>
      </h2>
      <div class="container-fluid">
        <div class="row justify-content-center">
          <div class="col-12 col-md-10">
            <div class="cards-description m-4 rounded-4" style="min-height: fit-content">
              <div class="text-center">
                <img class="d-block w-100 object-fit-cover shadow rounded mb-4" style="height: 300px"
                  src="${imageUrl}" alt="${service.name}"/>
              </div>

              <div class="text-center container">
                <p class="text-primary pb-3" style="height: auto; overflow: visible; font-size: 1.2rem">
                  ${description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Line -->
    <div class="container-fluid d-flex justify-content-center">
      <div class="line rounded shadow m-4"></div>
    </div>
  </article>`;
  }
//----------------------------------------------------------


  //--------------Fonction pour charger et afficher tous les habitats--------------
function loadServices() {
    console.log("Début du chargement des services");
  
    fetch(apiUrl + "service/list")
      .then((response) => {
        if (!response.ok) throw new Error("Erreur réseau: " + response.status);
        return response.json();
      })
      .then((services) => {
        console.log("Services reçus:", services);
        const serviceContainer = document.getElementById("service-container");
        if (!serviceContainer)
          throw new Error("Container service-container non trouvé");
  
        serviceContainer.innerHTML = "";
        services.forEach((service) => {
          const section = generateServiceSection(service);
          serviceContainer.insertAdjacentHTML("beforeend", section);
        });
  
        showAndHideElementsForRole();
      })
      .catch((error) => {
        console.error("Erreur:", error);
        console.error("Stack trace:", error.stack);
      });
  }
  //------------------------------------------
  
  //--------------Fonction pour initialiser le formulaire d'ajout Service--------------

function initializeAddServiceForm() {
    const addForm = document.getElementById('addServiceForm');
    if (addForm) {
        addForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Soumission du formulaire');

            try {
                const formData = new FormData(this);
                const serviceData = {
                    name: formData.get('name'),
                    description: formData.get('description')
                };

                const pictureFile = formData.get('Image');
                if (pictureFile && pictureFile.size > 0) {
                    if (pictureFile.size > MAX_FILE_SIZE) {
                        alert('L\'image est trop volumineuse. La taille maximale est de 2MB');
                        return;
                    }
                    const base64Picture = await convertFileToBase64(pictureFile);
                    serviceData.pictureData = base64Picture;
                }

                const response = await fetch(apiUrl + 'service/new', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(serviceData)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Erreur lors de la création');
                }

                const modal = bootstrap.Modal.getInstance(document.getElementById('addServiceModal'));
                modal.hide();

                 await loadServices();

                alert('Service créé avec succès !');
                this.reset();

            } catch (error) {
                console.error('Erreur:', error);
                alert(error.message);
            }
        });
    }
}
//-----------------------------------------------------

//--------------Fonction pour charger le script--------------
(function () {
    // Si le DOM est déjà chargé
    if (
      document.readyState === "complete" ||
      document.readyState === "interactive"
    ) {
        initializeAddServiceForm();
        loadServices();
    } else {
      // Sinon attendre le chargement du DOM
      document.addEventListener("DOMContentLoaded", () => {
          
          initializeAddServiceForm();
          loadServices();
      });
    }
    // () -> exucute imédiatement la fonction anonyme
  })();