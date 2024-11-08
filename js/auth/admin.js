async function getAnimalLikes(animalId) {
  try {
    const response = await fetch(`${apiUrl}animal/like/${animalId}`);
    if (!response.ok)
      throw new Error("Erreur lors de la récupération des likes");
    const data = await response.json();
    return data.likes;
  } catch (error) {
    console.error("Erreur:", error);
    return 0;
  }
}

// Fonction pour mettre à jour l'affichage des likes
function updateLikesDisplay(likes) {
  const likesInfo = document.getElementById("likesInfo");
  const likesCount = document.getElementById("likesCount");

  likesCount.textContent = `${likes} `;
  likesInfo.classList.remove("d-none");
}

// Modifier la gestion du changement d'animal
document
  .getElementById("animalSelect")
  .addEventListener("change", async (e) => {
    const animalId = e.target.value;
    if (animalId) {
      const likes = await getAnimalLikes(animalId);
      updateLikesDisplay(likes);
    } else {
      document.getElementById("likesInfo").classList.add("d-none");
    }
  });

function listAnimalsSelect(habitatId = null) {
  const animalSelect = document.getElementById("animalSelect");
  // Désactiver le select animal si aucun habitat n'est sélectionné
  if (!habitatId) {
    animalSelect.disabled = true;
    animalSelect.innerHTML =
      '<option value="">Sélectionnez d\'abord un habitat</option>';
    document.getElementById("likesInfo").classList.add("d-none");
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

// Fonction pour récupérer tous les likes des animaux
async function getAllAnimalsWithLikes() {
  try {
    // Récupérer tous les animaux
    const animalsResponse = await fetch(`${apiUrl}animal/list`);
    if (!animalsResponse.ok)
      throw new Error("Erreur lors de la récupération des animaux");
    const animals = await animalsResponse.json();

    // Récupérer les likes pour chaque animal
    const animalsWithLikes = await Promise.all(
      animals.map(async (animal) => {
        const likes = await getAnimalLikes(animal.id);
        return {
          ...animal,
          likes: likes,
        };
      })
    );

    // Trier par nombre de likes décroissant
    return animalsWithLikes.sort((a, b) => b.likes - a.likes);
  } catch (error) {
    console.error("Erreur:", error);
    return [];
  }
}
//------------------------------------------

// Fonction pour mettre à jour le tableau de classement
async function updateRankingTable() {
  const tableBody = document.getElementById("rankingTableBody");
  if (!tableBody) return;

  try {
    const animalsWithLikes = await getAllAnimalsWithLikes();
    tableBody.innerHTML = "";

    animalsWithLikes.forEach((animal, index) => {
      const row = document.createElement("tr");

      // Définir la classe de la médaille selon le rang
      let rankDisplay;
      if (index === 0) {
        rankDisplay = '<i class="bi bi-trophy-fill text-warning"></i>';
      } else if (index === 1) {
        rankDisplay = '<i class="bi bi-trophy-fill text-secondary"></i>';
      } else if (index === 2) {
        rankDisplay = '<i class="bi bi-trophy-fill text-danger"></i>';
      } else {
        rankDisplay = index + 1;
      }

      row.innerHTML = `
              <td class="align-middle">${rankDisplay}</td>
              <td class="align-middle">${animal.firstName}</td>
              <td class="align-middle">${animal.race.label}</td>
              <td class="align-middle">${animal.habitat.name}</td>
              <td class="align-middle">
                  <span class="badge bg-primary rounded-pill">
                      ${animal.likes}
                      <i class="bi bi-heart-fill text-danger ms-1"></i>
                  </span>
              </td>
          `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du classement:", error);
    tableBody.innerHTML = `
          <tr>
              <td colspan="5" class="text-center text-danger">
                  Erreur lors du chargement du classement
              </td>
          </tr>
      `;
  }
}
//------------------------------------------

// Ajouter un écouteur d'événements sur le select d'habitat
document
  .getElementById("habitatAnimalSelect")
  .addEventListener("change", (e) => {
    listAnimalsSelect(e.target.value);
  });

// Au chargement initial
if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  listHabitatsSelect();
  listAnimalsSelect();
  updateRankingTable();
} else {
  document.addEventListener("DOMContentLoaded", () => {
    listHabitatsSelect();
    listAnimalsSelect();
    updateRankingTable();
  });
}
