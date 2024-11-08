console.log("Hello Véto !");

// Fonction pour formater la date en YYYY-MM-DD -----------------
function formatDate(date) {
  return date.toISOString().split("T")[0];
}

// Fonction pour définir la date maximale selectionnable dans le Rapport du véto
function setMaxDate() {
  const today = new Date();
  const maxDate = formatDate(today);
  document.getElementById("vetoDate").setAttribute("max", maxDate);

  // Date par défaut
  document.getElementById("vetoDate").value = maxDate;
}
// ---------------------------------------------------------------

// Form Animal ----------------------------------------------------
document
  .getElementById("formAnimal")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const user = getUser();

    try {
      const formData = {
        animalId: parseInt(document.getElementById("animalSelect").value),
        username: user.username,
        visitDate: document.getElementById("vetoDate").value,
        comment: document.getElementById("vetoComment").value,
        feedType: document.getElementById("feedInput").value,
        feedQuantity: parseFloat(document.getElementById("feedWeight").value),
        feedUnit: document.getElementById("feedUnit").value,
      };

      const response = await fetch(`${apiUrl}veto-report/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'enregistrement du rapport");
      } else {
        loadUserReports();
      }

      alert("Rapport enregistré avec succès !");
      this.reset();
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de l'enregistrement du rapport");
    }
  });

// Fonction pour charger les rapports
async function loadUserReports() {
  const user = getUser();
  if (!user || !user.username) return;

  try {
    const response = await fetch(`${apiUrl}veto-report/user/${user.username}`);
    if (!response.ok) throw new Error("Erreur lors du chargement des rapports");

    const data = await response.json();

    // Trier les rapports par date de visite
    data.reports.sort((a, b) => {
      return new Date(b.visitDate) - new Date(a.visitDate);
    });

    const tbody = document.getElementById("reportsTableBody");
    tbody.innerHTML = ""; // Vider le tableau

    // Pour chaque rapport
    for (const report of data.reports) {
      // Récupérer les infos de l'animal
      const animalResponse = await fetch(`${apiUrl}animal/${report.animalId}`);
      const animal = await animalResponse.json();

      const row = document.createElement("tr");
      row.innerHTML = `
              <td>${new Date(report.visitDate).toLocaleDateString()}</td>
              <td>${animal.firstName}</td>
              <td>${animal.race.label}</td>
              <td>${report.feedType}</td>
              <td>${report.feedQuantity} ${report.feedUnit}</td>
              <td>${report.comment}</td>
          `;
      tbody.appendChild(row);
    }
  } catch (error) {
    console.error("Erreur:", error);
  }
}
// ---------------------------------------------------------------

// Écouteur d'événements sur le select d'habitat
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
  setMaxDate();
  loadUserReports();
} else {
  document.addEventListener("DOMContentLoaded", () => {
    listHabitatsSelect();
    listAnimalsSelect();
    setMaxDate();
    loadUserReports();
  });
}
