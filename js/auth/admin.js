// Fonction pour récupérer le nombre de likes d'un animal
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
//------------------------------------------

// Fonction pour récupérer le dernier rapport vétérinaire d'un animal
async function getLastVetoReport(animalId) {
  try {
    const response = await fetch(`${apiUrl}veto-report/animal/${animalId}`);
    if (!response.ok)
      throw new Error("Erreur lors de la récupération du rapport vétérinaire");
    const data = await response.json();
    // Retourne le premier rapport (le plus récent) ou null
    return data.reports && data.reports.length > 0 ? data.reports[0] : null;
  } catch (error) {
    console.error("Erreur:", error);
    return null;
  }
}
//------------------------------------------

// Fonction pour récupérer le dernier rapport employé d'un animal
async function getLastEmployeReport(animalId) {
  try {
    const response = await fetch(`${apiUrl}employe-report/animal/${animalId}`);
    if (!response.ok)
      throw new Error("Erreur lors de la récupération du rapport employé");
    const data = await response.json();
    // Retourne le premier rapport (le plus récent) ou null
    return data.reports && data.reports.length > 0 ? data.reports[0] : null;
  } catch (error) {
    console.error("Erreur:", error);
    return null;
  }
}
//------------------------------------------
// Fonction pour mettre à jour l'affichage des likes
function updateLikesDisplay(likes) {
  const likesInfo = document.getElementById("likesInfo");
  const likesCount = document.getElementById("likesCount");

  likesCount.textContent = `${likes} `;
  likesInfo.classList.remove("d-none");
}
//------------------------------------------

// Fonction pour mettre à jour l'affichage du dernier rapport vétérinaire
async function updateVetoReportDisplay(report, animal) {
  const reportContainer = document.getElementById("lastVetoReport");
  const tbody = document.getElementById("reportsVetoSelectedTableBody");
  tbody.innerHTML = "";

  if (report) {
    reportContainer.classList.remove("d-none");
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${new Date(report.visitDate).toLocaleDateString()}</td>
      <td>${animal.firstName}</td>
      <td>${animal.race.label}</td>
      <td>${report.feedType}</td>
      <td>${report.feedQuantity} ${report.feedUnit}</td>
      <td>${report.comment || "-"}</td>
      <td>${report.username}</td>
    `;
    tbody.appendChild(row);
  } else {
    reportContainer.classList.remove("d-none");
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center">Aucun rapport vétérinaire disponible</td>
      </tr>
    `;
  }
}
//------------------------------------------

// Fonction pour mettre à jour l'affichage du dernier rapport employé
async function updateEmployeReportDisplay(report, animal) {
  const reportContainer = document.getElementById("lastEmployeReport");
  const tbody = document.getElementById("reportsEmployeSelectedTableBody");
  tbody.innerHTML = "";

  if (report) {
    reportContainer.classList.remove("d-none");
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${new Date(report.visitDate).toLocaleDateString()} ${
      report.visitTime
    }</td>
      <td>${animal.firstName}</td>
      <td>${animal.race.label}</td>
      <td>
        Consommé: ${report.feedConsumedType}<br>
        Donné: ${report.feedGivenType}
      </td>
      <td>
        ${report.feedConsumedQuantity} ${report.feedConsumedUnit}<br>
        ${report.feedGivenQuantity} ${report.feedGivenUnit}
      </td>
      <td>${report.username}</td>
    `;
    tbody.appendChild(row);
  } else {
    reportContainer.classList.remove("d-none");
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center">Aucun rapport employé disponible</td>
      </tr>
    `;
  }
}
//------------------------------------------

// Modifier la gestion du changement d'animal
document
  .getElementById("animalSelect")
  .addEventListener("change", async (e) => {
    const animalId = e.target.value;
    if (animalId) {
      // Récupérer les données en parallèle
      const [likes, vetoReport, employeReport, animal] = await Promise.all([
        getAnimalLikes(animalId),
        getLastVetoReport(animalId),
        getLastEmployeReport(animalId),
        fetch(`${apiUrl}animal/${animalId}`).then((res) => res.json()),
      ]);

      // Mettre à jour les affichages
      updateLikesDisplay(likes);
      updateVetoReportDisplay(vetoReport, animal);
      updateEmployeReportDisplay(employeReport, animal);
    } else {
      // Réinitialiser tous les affichages
      document.getElementById("likesInfo").classList.add("d-none");
      document.getElementById("lastVetoReport").classList.add("d-none");
      document.getElementById("lastEmployeReport").classList.add("d-none");
    }
  });
//------------------------------------------

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

async function loadAllVetoReports() {
  try {
    const response = await fetch(`${apiUrl}veto-report/all`);

    if (!response.ok)
      throw new Error("Erreur lors du chargement des rapports vétérinaire");

    const data = await response.json();
    const tbody = document.getElementById("reportsTableBody");
    tbody.innerHTML = "";

    // Vérifier si data existe et contient des rapports
    if (!data || !data.reports) {
      throw new Error("Pas de rapports disponibles");
    }

    // Trier les rapports
    const sortedReports = data.reports.sort(
      (a, b) => new Date(b.visitDate) - new Date(a.visitDate)
    );

    for (const report of sortedReports) {
      const animalResponse = await fetch(`${apiUrl}animal/${report.animalId}`);
      const animal = await animalResponse.json();

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${new Date(report.visitDate).toLocaleDateString()}</td>
        <td>${animal.firstName}</td>
        <td>${animal.race.label}</td>
        <td>${report.feedType}</td>
        <td>${report.feedQuantity} ${report.feedUnit}</td>
        <td>${report.comment || "-"}</td>
        <td>${report.username}</td>
        `;
      tbody.appendChild(row);
    }
  } catch (error) {
    console.error("Erreur lors du chargement des rapports vétérinaire:", error);
  }
}
//------------------------------------------

// Fonction pour charger tous les rapports employés
async function loadAllEmployeReports() {
  try {
    const response = await fetch(`${apiUrl}employe-report/all`);

    if (!response.ok)
      throw new Error("Erreur lors du chargement des rapports employés");

    const data = await response.json();
    const tbody = document.getElementById("employeReportsTableBody");
    tbody.innerHTML = "";

    // Vérifier si data existe et contient des rapports
    if (!data || !data.reports) {
      throw new Error("Pas de rapports disponibles");
    }

    // Trier les rapports
    const sortedReports = data.reports.sort(
      (a, b) => new Date(b.visitDate) - new Date(a.visitDate)
    );

    for (const report of sortedReports) {
      const animalResponse = await fetch(`${apiUrl}animal/${report.animalId}`);
      const animal = await animalResponse.json();

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${new Date(report.visitDate).toLocaleDateString()} ${
        report.visitTime
      }</td>
        <td>${animal.firstName}</td>
        <td>${animal.race.label}</td>
        <td>
          Consommé: ${report.feedConsumedType}<br>
          Donné: ${report.feedGivenType}
        </td>
        <td>
          ${report.feedConsumedQuantity} ${report.feedConsumedUnit}<br>
          ${report.feedGivenQuantity} ${report.feedGivenUnit}
        </td>
        <td>${report.username}</td>
        `;
      tbody.appendChild(row);
    }
  } catch (error) {
    console.error("Erreur lors du chargement des rapports employés:", error);
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
  loadAllVetoReports();
  loadAllEmployeReports();
} else {
  document.addEventListener("DOMContentLoaded", () => {
    listHabitatsSelect();
    listAnimalsSelect();
    updateRankingTable();
    loadAllVetoReports();
    loadAllEmployeReports();
  });
}
