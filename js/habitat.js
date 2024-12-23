let habitatIdToDelete = null;
let habitatIdToEdit = null;

let animalIdToDelete = null;
let animalIdToEdit = null;

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB en octets

const deleteModalHabitat = document.getElementById("deleteHabitatModal");
const editModalHabitat = document.getElementById("editHabitatModal");

const deleteModalAnimal = document.getElementById("deleteAnimalModal");
const editModalAnimal = document.getElementById("editAnimalModal");

// Variable pour stocker les timestamps des derniers clics par animal
const lastClickTimestamps = new Map();
const CLICK_COOLDOWN = 2000; // Délai de 2 secondes entre chaque like

//--------------DELETE HABITAT--------------

if (deleteModalHabitat) {
  deleteModalHabitat.addEventListener("show.bs.modal", function (event) {
    const button = event.relatedTarget;
    habitatIdToDelete = button.getAttribute("data-habitat-id");
  });

  const habitatDeleteButton = document.getElementById("habitatDeleteButton");
  if (habitatDeleteButton) {
    habitatDeleteButton.addEventListener("click", async function () {
      if (!habitatIdToDelete) {
        console.error("ID de l'habitat manquant");
        return;
      }

      try {
        const response = await fetch(
          `${apiUrl}habitat/delete/${habitatIdToDelete}`,
          {
            method: "DELETE",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error);
        }

        const modal = bootstrap.Modal.getInstance(deleteModalHabitat);
        modal.hide();
        loadHabitats();
        alert("Habitat supprimé avec succès !");
      } catch (error) {
        console.error(error);
        alert(error.message);
      }
    });
  }
}
//---------------------------------------

//--------------EDIT HABITAT--------------

if (editModalHabitat) {
  editModalHabitat.addEventListener("show.bs.modal", function (event) {
    const button = event.relatedTarget;
    habitatIdToEdit = button.getAttribute("data-habitat-id");
    console.log("Modal ouvert pour éditer l'habitat ID:", habitatIdToEdit);

    fetch(`${apiUrl}habitat/${habitatIdToEdit}`)
      .then((response) => {
        if (!response.ok) {
          console.error("Status:", response.status);
          return response.text().then((text) => {
            console.error("Réponse:", text);
            throw new Error("Erreur lors de la récupération des données");
          });
        }
        return response.json();
      })
      .then((habitat) => {
        console.log("Données de l'habitat récupérées:", habitat);
        document.getElementById("editHabitatId").value = habitat.id;
        document.getElementById("editNameHabitat").value = habitat.name;
        document.getElementById("editDescriptionInput").value =
          habitat.description;
      })
      .catch((error) => {
        console.error("Erreur détaillée:", error);
        alert("Erreur lors de la récupération des données de l'habitat");
      });
  });

  const editForm = document.getElementById("editHabitatForm");
  if (editForm) {
    editForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      try {
        const formData = new FormData(this);
        const habitatData = {
          name: sanitizeHtml(formData.get("name")),
          description: sanitizeHtml(formData.get("description")),
        };

        const imageFile = formData.get("Image");
        if (imageFile && imageFile.size > 0) {
          const base64Image = await convertFileToBase64(imageFile);
          habitatData.pictureData = base64Image;
        }

        const response = await fetch(
          `${apiUrl}habitat/edit/${habitatIdToEdit}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(habitatData),
          }
        );

        if (!response.ok) {
          throw new Error("Erreur lors de la modification");
        }

        const modal = bootstrap.Modal.getInstance(editModalHabitat);
        modal.hide();

        // Rafraîchir la liste des habitats si la fonction existe
        if (typeof loadHabitats === "function") {
          loadHabitats();
        }

        alert("Habitat modifié avec succès !");
      } catch (error) {
        console.error("Erreur:", error);
        alert("Erreur lors de la modification de l'habitat");
      }
    });
  }
}
//-------------------------------------------

//--------------DELETE ANIMAL--------------
if (deleteModalAnimal) {
  // Quand le modal s'ouvre
  deleteModalAnimal.addEventListener("show.bs.modal", function (event) {
    const button = event.relatedTarget;
    animalIdToDelete = button.getAttribute("data-animal-id");
    console.log("Modal ouvert pour l'animal ID:", animalIdToDelete);
  });

  // Gestionnaire pour le bouton de suppression
  const confirmDeleteButton = document.getElementById("confirmDeleteButton");

  if (confirmDeleteButton) {
    confirmDeleteButton.addEventListener("click", async function () {
      if (!animalIdToDelete) {
        console.error("ID de l'animal manquant");
        return;
      }

      try {
        const response = await fetch(
          `${apiUrl}animal/delete/${animalIdToDelete}`,
          {
            method: "DELETE",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erreur lors de la suppression");
        }

        // Fermer le modal
        const modal = bootstrap.Modal.getInstance(deleteModalAnimal);
        modal.hide();

        // Rafraîchir la liste
        loadHabitats();
        loadAnimals();

        // Message de succès
        alert("Animal supprimé avec succès !");
      } catch (error) {
        console.error("Erreur:", error);
        alert("Impossible de supprimer cet animal");
      }
    });
  } else {
    console.error("Bouton de confirmation de suppression non trouvé");
  }
} else {
  console.error("Modal de suppression non trouvé");
}
//------------------------------------------

//--------------EDIT ANIMAL--------------

if (editModalAnimal) {
  // Quand le modal s'ouvre
  editModalAnimal.addEventListener("show.bs.modal", function (event) {
    const button = event.relatedTarget;
    animalIdToEdit = button.getAttribute("data-animal-id");
    console.log("Modal ouvert pour éditer l'animal ID:", animalIdToEdit);

    // Récupérer les données de l'animal
    fetch(`${apiUrl}animal/${animalIdToEdit}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des données");
        }
        return response.json();
      })
      .then((animal) => {
        console.log("Données de l'animal récupérées:", animal);

        // Remplir le formulaire
        document.getElementById("editAnimalId").value = animal.id;
        document.getElementById("editNameInput").value = animal.firstName;
        document.getElementById("editRaceInput").value = animal.race.id;
        document.getElementById("editStatusInput").value = animal.status;
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des données:", error);
        alert("Erreur lors de la récupération des données de l'animal");
      });
  });

  const editForm = document.getElementById("formEditAnimal");
  if (editForm) {
    editForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      console.log("Soumission du formulaire d'édition");

      try {
        const formData = new FormData(this);
        const animalData = {
          firstName: sanitizeHtml(formData.get("firstName")),
          race: parseInt(formData.get("race")),
          status: sanitizeHtml(formData.get("status")),
        };

        console.log("Données de l'animal à envoyer:", animalData);

        // Gestion de la photo
        const pictureFile = formData.get("picture");

        // Vérification de la taille du fichier
        if (pictureFile && pictureFile.size > 0) {
          if (pictureFile.size > MAX_FILE_SIZE) {
            alert(
              "L'image est trop volumineuse. La taille maximale est de 2MB"
            );
            return;
          }
          const base64Picture = await convertFileToBase64Animal(pictureFile);
          animalData.pictureData = base64Picture;
        }

        const response = await fetch(`${apiUrl}animal/edit/${animalIdToEdit}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(animalData),
        });

        console.log("Réponse de la requête édition:", response, animalData);

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        // Fermer le modal
        const modal = bootstrap.Modal.getInstance(editModalAnimal);
        modal.hide();

        // Rafraîchir la liste
        await loadAnimals();

        // Message de succès
        alert("Animal modifié avec succès !");
      } catch (error) {
        console.error("Erreur lors de la modification:", error);
        alert("Erreur lors de la modification: " + error.message);
      }
    });
  }
}
//------------------------------------------

//--------------Fonction pour générer le HTML d'un Article habitat--------------
function generateHabitatSection(habitat) {
  let description = habitat.description.replace(/\n/g, "<br>");
  description = description.replace(
    /\*\*(.*?)\*\*/g,
    '<strong class="text-important-textarea">$1</strong>'
  );

  let imageUrl = "../Images/Zoo/mediumBrownArcadia.png";

  if (habitat.pictures && habitat.pictures.length > 0) {
    imageUrl = `${apiUrl}${habitat.pictures[0].path}`;
  }

  return `
    <article class="article-bg shadow">
        <div>
            <h2 id="${habitat.name.toLowerCase()}" class="text-center font-subtitle bg-dark text-primary p-4">
                <button type="button" class="btn btn-outline-light text-danger" 
                        data-bs-toggle="modal"
                        data-bs-target="#deleteHabitatModal" 
                        data-habitat-id="${habitat.id}" data-show="1">
                    <i class="bi bi-trash"></i>
                </button>
                ${habitat.name}
                <button type="button" class="btn btn-outline-light text-info" data-bs-toggle="modal"
                        data-bs-target="#editHabitatModal" 
                        data-habitat-id="${habitat.id}"
                        data-show="2" data-show="1">
                    <i class="bi bi-pencil-square"></i>
                </button>
            </h2>

            <div class="descritpion-habitat container">
                <a class="m-0" data-bs-toggle="collapse" href="#collapse${
                  habitat.id
                }" role="button" aria-expanded="false"
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
                    <div class="container text-center text-primary pb-3" style="height: auto; overflow: visible; font-size: 1.2rem">
                        <p>${description}</p>
                    </div>
                    
                    <div class="d-flex flex-row justify-content-evenly flex-wrap p-4" id="addCard${
                      habitat.id
                    }Animal">
                    </div>
                </div>
            </div>
        </div>
    </article>`;
}
//-----------------------------

//--------------Fonction pour charger et afficher tous les habitats--------------
function loadHabitats() {
  console.log("Début du chargement des habitats");

  fetch(apiUrl + "habitat/list")
    .then((response) => {
      if (!response.ok) throw new Error("Erreur réseau: " + response.status);
      return response.json();
    })
    .then((habitats) => {
      console.log("Habitats reçus:", habitats);
      const habitatContainer = document.getElementById("habitat-container");
      if (!habitatContainer)
        throw new Error("Container habitat-container non trouvé");

      habitatContainer.innerHTML = "";
      habitats.forEach((habitat) => {
        const section = generateHabitatSection(habitat);
        habitatContainer.insertAdjacentHTML("beforeend", section);
      });

      loadAnimals();
      showAndHideElementsForRole();
    })
    .catch((error) => {
      console.error("Erreur:", error);
      console.error("Stack trace:", error.stack);
    });
}
//------------------------------------------

//--------------Fonction pour générer le HTML d'une card animal--------------
function generateAnimalCard(animal) {
  // Déterminer l'URL de l'image
  let imageUrl;

  if (animal.picture && animal.picture.url) {
    imageUrl = `${apiUrl}${animal.picture.url}`;
  } else {
    imageUrl = "../Images/Savane/lion.jpg";
  }

  const card = `
        <div class="image-card card p-0 m-4 shadow rounded-4 img-dezoom-container" style="width: 15rem">
          <a href="#" class="text-decoration-none animal-click" data-animal-id="${animal.id}">
            <img src="${imageUrl}" 
                 class="card-img-top object-fit-cover img-card-h rounded-top-4" 
                 alt="${animal.firstName}" />
          </a>
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
                </ul>
                <button type="button" 
                        class="btn btn-link text-decoration-none"
                        data-bs-toggle="modal" 
                        data-bs-target="#vetReportModal" 
                        data-animal-id="${animal.id}">Rapport du vétérinaire
                    <i class="bi bi-eye"></i>
                </button>
            </div>
        </div>
    `;

  return card;
}
//------------------------------------------

//--------------Fonction pour charger et afficher le rapport vétérinaire--------------
function initializeVetReportHandlers() {
  document.addEventListener("click", async function (e) {
    const vetButton = e.target.closest(".btn-link[data-animal-id]");
    if (!vetButton) return;

    e.preventDefault();
    const animalId = vetButton.dataset.animalId;
    const contentDiv = document.getElementById("vetReportContent");

    // Afficher le spinner
    contentDiv.innerHTML = `
      <div class="text-center p-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
      </div>
    `;

    try {
      const response = await fetch(`${apiUrl}veto-report/last/${animalId}`);
      const report = await response.json();

      contentDiv.innerHTML = `
  <div class="bg-primary p-4 pb-2">

    <div class="mb-4">
      <h5 class="d-flex align-items-center bg-dark font-subtitle text-secondary p-2 rounded-top mb-0">
        <i class="bi bi-calendar3 me-2"></i>
        Informations générales
      </h5>
      <div class="bg-light p-3 rounded-bottom border">
        <div class="row g-3">
          <div class="col-md-6">
            <div class="d-flex align-items-center">
              <span class="font-subtitle text-dark me-2">Date de visite:</span>
              <span>${new Date(report.visitDate).toLocaleDateString(
                "fr-FR"
              )}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Alimentation -->
    <div class="mb-4">
      <h5 class="d-flex align-items-center bg-dark font-subtitle text-secondary p-2 rounded-top mb-0">
        <i class="bi bi-cup-hot me-2"></i>
        Alimentation
      </h5>
      <div class="bg-light p-3 rounded-bottom border">
        <div class="row g-3">
          <div class="col-md-6">
            <div class="d-flex align-items-center">
              <span class="font-subtitle text-dark me-2">Type:</span>
              <span>${report.feedType || "Non spécifié"}</span>
            </div>
          </div>
          <div class="col-md-6">
            <div class="d-flex align-items-center">
              <span class="font-subtitle text-dark me-2">Quantité:</span>
              <span>${report.feedQuantity || "0"} ${
        report.feedUnit || "unité"
      }</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Observations -->
    <div class="mb-3">
      <h5 class="d-flex align-items-center bg-dark font-subtitle text-secondary p-2 rounded-top mb-0">
        <i class="bi bi-chat-text me-2"></i>
        Observations
      </h5>
      <div class="bg-light p-3 rounded-bottom border">
        <p class="mb-0">
          ${report.comment || "Aucune observation"}
        </p>
      </div>
    </div>
  </div>
`;
    } catch (error) {
      console.error("Erreur:", error);
      contentDiv.innerHTML = `
        <div class="alert alert-warning m-3">
          <h6 class="alert-heading">Erreur</h6>
          <p class="mb-0">Une erreur est survenue lors du chargement du rapport vétérinaire.</p>
        </div>
      `;
    }
  });
}
//------------------------------------------

//--------------Fonction pour ajouter les likes au clic sur les animaux--------------
function initializeAnimalLikeHandlers() {
  document.addEventListener("click", async function (e) {
    if (e.target.closest(".animal-click")) {
      e.preventDefault();
      const link = e.target.closest(".animal-click");
      const animalId = link.getAttribute("data-animal-id");

      // Vérification du délai depuis le dernier clic
      const lastClick = lastClickTimestamps.get(animalId);
      const now = Date.now();

      if (lastClick && now - lastClick < CLICK_COOLDOWN) {
        console.log("Veuillez patienter avant de liker à nouveau");
        return; // Sortir de la fonction si le cooldown est actif
      }

      try {
        // Créer l'animation avant la requête
        createClickAnimation(e.clientX, e.clientY);

        // Mise à jour du timestamp du dernier clic
        lastClickTimestamps.set(animalId, now);

        const response = await fetch(`${apiUrl}animal/like/${animalId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Erreur lors de l'ajout du like");
        }

        console.log("Like ajouté avec succès");
      } catch (error) {
        console.error("Erreur:", error);
        // En cas d'erreur, on réinitialise le timestamp pour permettre un nouvel essai
        lastClickTimestamps.delete(animalId);
      }
    }
  });
}
//------------------------------------------

//--------------Fonction pour créer l'animation du clic--------------
function createClickAnimation(x, y) {
  const heart = document.createElement("div");
  heart.innerHTML = '<i class="bi bi-hearts"></i>';
  heart.className = "click-heart";
  heart.style.left = `${x}px`;
  heart.style.top = `${y}px`;
  document.body.appendChild(heart);

  // Supprimer l'élément après l'animation
  heart.addEventListener("animationend", () => {
    document.body.removeChild(heart);
  });
}

//------------------------------------------

//--------------Fonction pour charger et afficher tous les animaux--------------
function loadAnimals() {
  fetch(apiUrl + "animal/list")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erreur réseau: " + response.status);
      }
      return response.json();
    })
    .then((animals) => {
      console.log("Animaux reçus:", animals);

      // Créer un objet pour stocker les conteneurs par habitat
      const habitatGalleries = {};

      // Vider et initialiser tous les conteneurs d'habitat
      animals.forEach((animal) => {
        const habitatId = animal.habitat.id;
        const galleryId = `addCard${habitatId}Animal`;

        if (!habitatGalleries[habitatId]) {
          const gallery = document.getElementById(galleryId);
          if (gallery) {
            gallery.innerHTML = ""; // Vider le conteneur
            habitatGalleries[habitatId] = gallery;
          }
        }
      });

      // Afficher les animaux
      animals.forEach((animal) => {
        const card = generateAnimalCard(animal);
        const habitatId = animal.habitat.id;
        const gallery = habitatGalleries[habitatId];

        if (gallery) {
          gallery.insertAdjacentHTML("beforeend", card);
        } else {
          console.warn(`Conteneur non trouvé pour l'habitat ID: ${habitatId}`);
        }
      });

      showAndHideElementsForRole();
    })
    .catch((error) => {
      console.error("Erreur lors du chargement des animaux:", error);
    });
}
//------------------------------------------

//--------------Fonction pour initialiser le formulaire d'ajout Habitat--------------

function initializeAddHabitatForm() {
  const addForm = document.getElementById("addHabitatForm");
  if (addForm) {
    addForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      console.log("Soumission du formulaire");

      try {
        const formData = new FormData(this);
        const habitatData = {
          name: sanitizeHtml(formData.get("name")),
          description: sanitizeHtml(formData.get("description")),
        };

        const pictureFile = formData.get("Image");
        if (pictureFile && pictureFile.size > 0) {
          if (pictureFile.size > MAX_FILE_SIZE) {
            alert(
              "L'image est trop volumineuse. La taille maximale est de 2MB"
            );
            return;
          }
          const base64Picture = await convertFileToBase64(pictureFile);
          habitatData.pictureData = base64Picture;
        }

        const response = await fetch(apiUrl + "habitat/new", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(habitatData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erreur lors de la création");
        }

        const modal = bootstrap.Modal.getInstance(
          document.getElementById("addHabitatModal")
        );
        modal.hide();

        await loadHabitats();
        await listHabitatsSelect();

        alert("Habitat créé avec succès !");
        this.reset();
      } catch (error) {
        console.error("Erreur:", error);
        alert(error.message);
      }
    });
  }
}

//--------------Fonction pour initialiser le formulaire d'ajout Animal--------------
function initializeAddAnimalForm() {
  const addForm = document.getElementById("formAddAnimal");
  if (addForm) {
    addForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      console.log("Soumission du formulaire");

      try {
        const formData = new FormData(this);

        // Récupérer et vérifier l'habitat_id
        const habitatId = formData.get("habitat");
        if (!habitatId) {
          throw new Error("Veuillez sélectionner un habitat");
        }

        const animalData = {
          firstName: sanitizeHtml(formData.get("firstName")),
          race: parseInt(formData.get("race")),
          habitat: parseInt(habitatId), // s'assurer que c'est un nombre
          status: sanitizeHtml(formData.get("status")),
        };

        const pictureFile = formData.get("Image");
        if (pictureFile && pictureFile.size > 0) {
          if (pictureFile.size > MAX_FILE_SIZE) {
            alert(
              "L'image est trop volumineuse. La taille maximale est de 2MB"
            );
            return;
          }
          const base64Picture = await convertFileToBase64Animal(pictureFile);
          animalData.pictureData = base64Picture;
        }

        const response = await fetch(apiUrl + "animal/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(animalData),
        });

        console.log("Réponse de la création de l'animal:", animalData);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Erreur lors de la création");
        }

        // Fermer le modal
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("addAnimalModal")
        );
        modal.hide();

        // Rafraîchir la liste
        await loadAnimals();

        // Message de succès
        alert("Animal créé avec succès !");

        // Réinitialiser le formulaire
        this.reset();
      } catch (error) {
        console.error("Erreur complète:", error);
        alert("Erreur lors de la création: " + error.message);
      }
    });
  }
}
//------------------------------------------

//--------------Fonction pour convertir un fichier en base64--------------
function convertFileToBase64Animal(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
//------------------------------------------

//--------------Fonction pour charger le script--------------
(function () {
  if (typeof loadAnimals === "undefined") {
    console.error("Le fichier animal.js n'est pas chargé correctement");
    return;
  }

  // Si le DOM est déjà chargé
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    initializeAddHabitatForm();
    listHabitatsSelect();
    initializeAddAnimalForm();
    loadHabitats();
    initializeAnimalLikeHandlers();
    initializeVetReportHandlers();
  } else {
    // Sinon attendre le chargement du DOM
    document.addEventListener("DOMContentLoaded", () => {
      initializeAddHabitatForm();
      listHabitatsSelect();
      initializeAddAnimalForm();
      loadHabitats();
      initializeAnimalLikeHandlers();
      initializeVetReportHandlers();
    });
  }
  // () -> exucute imédiatement la fonction anonyme
})();

//-----------------------------------------
