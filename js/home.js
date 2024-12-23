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
          <button type="button" data-show="3" data-show="1" class="btn btn-outline-danger circle-border text-primary" 
                  onclick="supprimerAvis('${avis.id}')">
              <i class="bi bi-ban"></i>
          </button>

          <img src="../Images/Zoo/person-circle.svg" 
                class="rounded-circle p-profile" 
                alt="Image de profil" />

            <div class="d-flex flex-column min-width-content">
              <div class="text-warning mb-1 stars-container">
                  ${generateStars(avis.note)}
            </div>
              <h5 class="mb-0 font-subtitle text-truncate">${avis.nom}</h5>
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
                class="rounded-circle p-profile" 
                alt="Image de profil" />

            <div class="d-flex flex-column min-width-content">
              <div class="text-warning mb-1 stars-container">
                  ${generateStars(avis.note)}
            </div>
              <h5 class="mb-0 font-subtitle text-truncate">${avis.nom}</h5>
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
      showAndHideElementsForRole();
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
//faille xss sécurisée
function soumettreAvis(e) {
  e.preventDefault();
  const avis = {
    // sanitize dans le front (< = &lt et > = &gt) puis dans le back avec htmlspecialchars dans AvisController.php
    nom: sanitizeHtml(document.getElementById("nom").value),
    commentaire: sanitizeHtml(document.getElementById("commentaire").value),
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

//--------------Fonction pour récupérer les données météo en direct--------------
const apiKey = "d408b2585e4efe44f7725a1691a98ff2";

let city = "Paimpont";

async function recupDonnees(city, callback) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );
    const data = await response.json();
    callback(data);
  } catch {
    console.log("Error");
  }
}

function affTemp(dt) {
  const weatherIcon = `https://openweathermap.org/img/wn/${dt.weather[0].icon}@2x.png`;
  console.log(dt);
  document.getElementById("content").innerHTML = `
    <div class="row g-3">
      <div class="col-md-6">
        <div class="weather-card rounded-4">
          <div class="d-flex align-items-center">
            <div class="weather-main p-4 text-center">
              <img src="${weatherIcon}" alt="${
    dt.weather[0].description
  }" class="weather-icon mb-2">
              <h2 class="temp-display mb-0">${Math.round(dt.main.temp)}°C</h2>
              <h5 class="city-name mb-0">${dt.name}, FR</h5>
            </div>
            <div class="weather-details flex-grow-1 p-4 border-start">
              <div class="weather-detail-item">
                <i class="bi bi-thermometer-half"></i>
                <span>Ressenti ${Math.round(dt.main.feels_like)}°C</span>
              </div>
              <div class="weather-detail-item">
                <i class="bi bi-droplet-fill"></i>
                <span>Humidité ${dt.main.humidity}%</span>
              </div>
              <div class="weather-detail-item">
                <i class="bi bi-wind"></i>
                <span>Vent ${Math.round(dt.wind.speed * 3.6)} km/h</span>
              </div>
              <div class="weather-detail-item">
                <i class="bi bi-thermometer"></i>
                <span>Min/Max ${Math.round(dt.main.temp_min)}° / ${Math.round(
    dt.main.temp_max
  )}°</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-6" id="forecast-container"></div>
    </div>
  `;
}
//---------------------------------------------------------

//--------------Fonction pour récupérer les prévisions météo à 12h--------------
async function recupDonneesFiveDays(dt) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${dt.coord.lat}&lon=${dt.coord.lon}&appid=${apiKey}&units=metric`
    );
    const data = await response.json();
    affFiveDays(data);
  } catch (error) {
    console.error("Erreur lors de la récupération des prévisions:", error);
  }
}

function affFiveDays(dtfd) {
  const dailyForecasts = dtfd.list.filter((item) =>
    item.dt_txt.includes("12:00:00")
  );
  console.log(dailyForecasts);

  const forecastHTML = `
    <div class="forecast-navigation position-relative">
      <button class="btn btn-nav btn-prev" onclick="scrollForecasts('left')" aria-label="Précédent">
        <i class="bi bi-chevron-left"></i>
      </button>
      
      <div class="forecast-scroll-container">
        <div class="d-flex gap-3" id="forecastWrapper">
          ${dailyForecasts
            .map(
              (day) => `
            <div class="forecast-card rounded-4" style="width: calc(33.333% - 1rem)">
              <div class="text-center">
                <h6 class="text-primary">${new Date(
                  day.dt * 1000
                ).toLocaleDateString("fr-FR", { weekday: "long" })}</h6>
                <img src="https://openweathermap.org/img/wn/${
                  day.weather[0].icon
                }@2x.png" 
                     alt="${day.weather[0].description}" 
                     class="weather-icon my-2">
                <div class="d-flex justify-content-center gap-2">
                  <span class="temp-max">${Math.round(
                    day.main.temp_max
                  )}°</span>
                  <span class="temp-min">${Math.round(
                    day.main.temp_min
                  )}°</span>
                </div>
                <div class="mt-2 small weather-info">
                  <div><i class="bi bi-droplet-fill"></i> ${
                    day.main.humidity
                  }%</div>
                  <div><i class="bi bi-wind"></i> ${Math.round(
                    day.wind.speed * 3.6
                  )} km/h</div>
                </div>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
      
      <button class="btn btn-nav btn-next" onclick="scrollForecasts('right')" aria-label="Suivant">
        <i class="bi bi-chevron-right"></i>
      </button>
    </div>
  `;

  document.getElementById("forecast-container").innerHTML = forecastHTML;
  updateNavigationButtons();
}

// Fonction pour gérer le défilement
function scrollForecasts(direction) {
  const container = document.querySelector(".forecast-scroll-container");
  const scrollAmount = container.clientWidth / 3; // Défilement d'une carte

  if (direction === "left") {
    container.scrollBy({
      left: -scrollAmount,
      behavior: "smooth",
    });
  } else {
    container.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  }

  // Mettre à jour l'état des boutons après le défilement
  setTimeout(updateNavigationButtons, 300);
}

// Fonction pour mettre à jour l'état des boutons de navigation
function updateNavigationButtons() {
  const container = document.querySelector(".forecast-scroll-container");
  const btnPrev = document.querySelector(".btn-prev");
  const btnNext = document.querySelector(".btn-next");

  if (container) {
    const isAtStart = container.scrollLeft <= 0;
    const isAtEnd =
      container.scrollLeft >= container.scrollWidth - container.clientWidth - 1;

    btnPrev.style.opacity = isAtStart ? "0.3" : "1";
    btnPrev.style.pointerEvents = isAtStart ? "none" : "auto";

    btnNext.style.opacity = isAtEnd ? "0.3" : "1";
    btnNext.style.pointerEvents = isAtEnd ? "none" : "auto";
  }
}

//---------------------------------------------------------

//--------------Initialisation--------------
(function () {
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    recupDonnees(city, (dt) => {
      affTemp(dt);
      recupDonneesFiveDays(dt, (dtfd) => {
        affFiveDays(dtfd);
      });
    });
    loadHabitats();
    loadAvisEnAttente();
    loadAvisValides();
    const formAvis = document.getElementById("form-avis");
    if (formAvis) {
      formAvis.addEventListener("submit", soumettreAvis);
    }
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      recupDonnees(city, (dt) => {
        affTemp(dt);
        recupDonneesFiveDays(dt, (dtfd) => {
          affFiveDays(dtfd);
        });
      });
      loadHabitats();
      loadAvisEnAttente();
      loadAvisValides();
    });
  }
})();
