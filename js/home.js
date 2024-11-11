//--------------Fonction pour générer le HTML d'une card habitat--------------
function generateHabitatCard(habitat) {
  let description = habitat.description.replace(/\n/g, "<br>");
  description = description.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  let imageUrl = "../Images/Zoo/mediumBrownArcadia.png";

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
  console.log("Début du chargement des habitats");

  fetch(apiUrl + "habitat/list")
    .then((response) => {
      if (!response.ok) throw new Error("Erreur réseau: " + response.status);
      return response.json();
    })
    .then((habitats) => {
      console.log("Habitats reçus:", habitats);
      const habitatGallery = document.getElementById("addCardHabitat");
      if (!habitatGallery)
        throw new Error("Container addCardHabitat non trouvé");

      habitatGallery.innerHTML = "";
      habitats.forEach((habitat) => {
        const card = generateHabitatCard(habitat);
        habitatGallery.insertAdjacentHTML("beforeend", card);
      });

      showAndHideElementsForRole();
    })
    .catch((error) => {
      console.error("Erreur:", error);
      console.error("Stack trace:", error.stack);
    });
}
//------------------------------------------------------

//--------------Fonction pour générer le HTML d'un avis--------------
function generateAvisCard(avis) {
  return `
      <div class="d-flex flex-column flex-md-row align-items-center bg-avis rounded-4 shadow m-3 p-3 p-md-4 gap-3 gap-md-4">
      <div class="d-flex align-items-center gap-3 gap-md-4">
          <button type="button" class="btn btn-outline-danger circle-border text-primary" 
                  onclick="supprimerAvis('${avis.id}')">
              <i class="bi bi-ban"></i>
          </button>

          <img src="../Images/Zoo/person-circle.svg" 
                class="rounded-circle" 
                style="width: 60px; height: 60px; min-width: 60px; object-fit: cover" 
                alt="Image de profil" />

            <div class="d-flex flex-column">
              <div class="text-warning mb-1">
                  ${generateStars(avis.note)}
            </div>
              <h5 class="mb-0 font-subtitle">${avis.nom}</h5>
          </div>
        </div>
          
        <div class="flex-grow-1 text-center text-md-start my-2 my-md-0">
            <p class="mb-0">${avis.commentaire}</p>
        </div>
    </div>
  `;
}
//---------------------------------------------------------

//--------------Fonction pour générer le HTML d'un avis en attente--------------
function generateAvisEnAttenteCard(avis) {
  return `
    <div class="d-flex flex-column flex-md-row align-items-center bg-avis rounded-4 shadow m-3 p-3 p-md-4 gap-3 gap-md-4">
      <div class="d-flex align-items-center gap-3 gap-md-4">
          <button type="button" class="btn btn-outline-danger circle-border text-primary" 
                  onclick="supprimerAvis('${avis.id}')">
              <i class="bi bi-ban"></i>
          </button>

          <img src="../Images/Zoo/person-circle.svg" 
                class="rounded-circle" 
                style="width: 60px; height: 60px; min-width: 60px; object-fit: cover" 
                alt="Image de profil" />

            <div class="d-flex flex-column">
              <div class="text-warning mb-1">
                  ${generateStars(avis.note)}
            </div>
              <h5 class="mb-0 font-subtitle">${avis.nom}</h5>
          </div>
        </div>
          
        <div class="flex-grow-1 text-center text-md-start my-2 my-md-0">
            <p class="mb-0">${avis.commentaire}</p>
        </div>

        <button type="button" class="btn btn-outline-success circle-border text-primary" 
                onclick="validerAvis('${avis.id}')">
            <i class="bi bi-check-lg"></i>
        </button>
    </div>
  `;
}
//---------------------------------------------------------

//--------------Fonction pour générer les étoiles--------------
function generateStars(note) {
  let stars = "";
  for (let i = 0; i < 5; i++) {
    stars += `<i class="bi bi-star${i < note ? "-fill" : ""}"></i>`;
  }
  return stars;
}
//---------------------------------------------------------

//--------------Fonction pour charger les avis validés--------------
function loadAvisValides() {
  fetch(apiUrl + "avis/valides")
    .then((response) => response.json())
    .then((data) => {
      const avisContainer = document.getElementById("avisValides");
      if (!avisContainer) return;

      avisContainer.innerHTML = "";
      data.avis.forEach((avis) => {
        const card = generateAvisCard(avis);
        avisContainer.insertAdjacentHTML("beforeend", card);
      });
    })
    .catch((error) => console.error("Erreur:", error));
}
//---------------------------------------------------------

//--------------Fonction pour charger les avis en attente--------------
function loadAvisEnAttente() {
  fetch(apiUrl + "avis/not-valid")
    .then((response) => response.json())
    .then((data) => {
      const avisContainer = document.getElementById("avisEnAttente");
      if (!avisContainer) return;

      avisContainer.innerHTML = "";
      data.avis.forEach((avis) => {
        const card = generateAvisEnAttenteCard(avis);
        avisContainer.insertAdjacentHTML("beforeend", card);
      });
    })
    .catch((error) => console.error("Erreur:", error));
}
//---------------------------------------------------------

//--------------Fonction pour soumettre un nouvel avis--------------
function soumettreAvis(e) {
  e.preventDefault();
  const avis = {
    nom: document.getElementById("nom").value,
    commentaire: document.getElementById("commentaire").value,
    note: parseInt(document.getElementById("note").value),
  };

  fetch(apiUrl + "avis/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(avis),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("Merci pour votre avis ! Il sera visible après validation.");
        document.getElementById("avisModal").querySelector("form").reset();
        bootstrap.Modal.getInstance(
          document.getElementById("avisModal")
        ).hide();
      }
    })
    .catch((error) => console.error("Erreur:", error));
}
//---------------------------------------------------------

//--------------Fonction pour valider un avis--------------
function validerAvis(id) {
  fetch(apiUrl + `avis/valided/${id}`, {
    method: "PUT",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        loadAvisEnAttente();
        loadAvisValides();
      }
    })
    .catch((error) => console.error("Erreur:", error));
}
//---------------------------------------------------------

//--------------Fonction pour supprimer un avis--------------
function supprimerAvis(id) {
  fetch(apiUrl + `avis/${id}`, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        loadAvisEnAttente();
        loadAvisValides();
      }
    })
    .catch((error) => console.error("Erreur:", error));
}
//---------------------------------------------------------

//--------------Initialisation--------------
(function () {
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    loadHabitats();
    loadAvisEnAttente();
    loadAvisValides();
    const formAvis = document.getElementById("form-avis");
    if (formAvis) {
      formAvis.addEventListener("submit", soumettreAvis);
    }
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      loadHabitats();
      loadAvisEnAttente();
      loadAvisValides();
    });
  }
})();
