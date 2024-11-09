const tokenCookieName = "accesstoken";
const RoleCookieName = "role";
const signoutBtn = document.getElementById("signout-btn");
const apiUrl = "http://127.0.0.1:8000/";

signoutBtn.addEventListener("click", signout);

function getUser() {
  const stringUser = sessionStorage.getItem("user");
  const user = JSON.parse(stringUser);
  return user;
}

function signout() {
  sessionStorage.clear();
  window.location.replace("/");
}

function isConnected() {
  return sessionStorage.getItem("user") !== null;
}

// disconnected, connected (1, vetérinaire ou employe)

function showAndHideElementsForRole() {
  const userConnected = isConnected();
  const user = getUser();
  console.log(user);

  let roleId;
  if (user) roleId = user.roleId;

  let allElementsToEdit = document.querySelectorAll("[data-show]");

  allElementsToEdit.forEach((element) => {
    switch (element.dataset.show) {
      case "disconnected":
        if (userConnected) {
          element.classList.add("d-none");
        }
        break;
      case "connected":
        if (!userConnected) {
          element.classList.add("d-none");
        }
        break;
      case "1":
        if (!userConnected || roleId != 1) {
          element.classList.add("d-none");
        }
        break;
      case "2":
        if (!userConnected || (roleId != 2 && roleId != 1)) {
          element.classList.add("d-none");
        }
        break;
      case "3":
        if (!userConnected || (roleId != 3 && roleId != 1)) {
          element.classList.add("d-none");
        }
        break;
    }
  });
}

// Sécurisation de la faille XSS ----------------------------

function sanitizeHtml(text) {
  const tempHtml = document.createElement("div");
  tempHtml.textContent = text;
  return tempHtml.innerHTML;
}
//------------------------------------------------------

// Récupération des information de l'utilisateur ------------------

function getInfosUser() {
  let myHeaders = new Headers();
  myHeaders.append("X-AUTH-TOKEN", getToken());

  let requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  fetch(apiUrl + "account/me", requestOptions)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        console.log("Impossible de récupérer les informations utilisateur");
      }
    })
    .then((result) => {
      return result;
    })
    .catch((error) => {
      console.error(
        "erreur lors de la récupération des données utilisateur",
        error
      );
    });
}
//------------------------------------------------------------------------

//--------------Fonction pour convertir un fichier en base64--------------
function convertFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
//-------------------------------------------------------------------------

//--------------Fonction pour remplir le select habitat--------------
function listHabitatsSelect() {
  fetch(apiUrl + "habitat/list")
    .then((response) => {
      if (!response.ok) throw new Error("Erreur réseau: " + response.status);
      return response.json();
    })
    .then((habitats) => {
      const select = document.getElementById("habitatAnimalSelect");
      if (!select) {
        console.error("Select habitat non trouvé");
        return;
      }

      // Garder l'option par défaut
      const defaultOption = select.querySelector('option[value=""]');
      select.innerHTML = "";
      if (defaultOption) select.appendChild(defaultOption);

      // Ajouter les options pour chaque habitat
      habitats.forEach((habitat) => {
        const option = document.createElement("option");
        option.value = habitat.id;
        option.textContent = habitat.name;
        select.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Erreur lors du chargement des habitats:", error);
    });
}
//------------------------------------------

function listAnimalsSelect(habitatId = null) {
  const animalSelect = document.getElementById("animalSelect");
  // Désactiver le select animal si aucun habitat n'est sélectionné
  if (!habitatId) {
    animalSelect.disabled = true;
    animalSelect.innerHTML =
      '<option value="">Sélectionnez d\'abord un habitat</option>';
    return;
  } else {
    // Activer le select animal
    animalSelect.disabled = false;

    fetch(apiUrl + "animal/list")
      .then((response) => {
        if (!response.ok) throw new Error("Erreur réseau: " + response.status);
        return response.json();
      })
      .then((animals) => {
        if (!animalSelect) {
          console.error("Select Animal non trouvé");
          return;
        } else {
          // Réinitialiser le select
          animalSelect.innerHTML =
            '<option value="">Choisir un animal</option>';
          // Filtrer les animaux de l'habitat sélectionné et les trier par ordre alphabétique
          const filteredAnimals = animals
            .filter((animal) => animal.habitat.id === parseInt(habitatId))
            .sort((a, b) => a.firstName.localeCompare(b.firstName, "fr"));

          // Ajouter les options pour chaque animal filtré
          filteredAnimals.forEach((animal) => {
            const option = document.createElement("option");
            option.value = animal.id;
            option.textContent = animal.firstName + " - " + animal.race.label;
            animalSelect.appendChild(option);
          });
        }
      })
      .catch((error) => {
        console.error("Erreur lors du chargement des animaux:", error);
      });
  }
}

// Fonction pour formater la date en YYYY-MM-DD -----------------
function formatDate(date) {
  return date.toISOString().split("T")[0];
}
// Fonction pour définir la date maximale selectionnable dans le Rapport
function setMaxDate() {
  const today = new Date();
  const maxDate = formatDate(today);

  const vetoDateInput = document.getElementById("vetoDate");
  const employeDateInput = document.getElementById("employeDate");

  if (vetoDateInput) {
    vetoDateInput.setAttribute("max", maxDate);
    vetoDateInput.value = maxDate;
  } else if (employeDateInput) {
    employeDateInput.setAttribute("max", maxDate);
    employeDateInput.value = maxDate;
  }
}
// ---------------------------------------------------------------
