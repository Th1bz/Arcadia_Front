console.log("employe.js");

// Écouteur d'événements sur le select d'habitat
document
  .getElementById("habitatAnimalSelect")
  .addEventListener("change", (e) => {
    listAnimalsSelect(e.target.value);
  });

// Fonction pour définir l'heure actuelle dans le champ Heure de visite
function setCurrentTime() {
  const timeInput = document.getElementById("employeTime");
  if (timeInput) {
    const now = new Date();
    // Formatage de l'heure au format HH:MM
    const currentTime = now.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    timeInput.value = currentTime;
  }
}

// ----------------------------------------------------------------

// Form Employe Feed Animal -------------------------------------------------
document
  .getElementById("formFeedAnimal")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const user = getUser();

    try {
      const formData = {
        animalId: parseInt(document.getElementById("animalSelect").value),
        username: user.username,
        visitDate: document.getElementById("employeDate").value,
        visitTime: document.getElementById("employeTime").value,
        feedConsumed: {
          type: document.getElementById("employeFeedConsumedInput").value,
          quantity: parseFloat(
            document.getElementById("employeFeedConsumedWeight").value
          ),
          unit: document.getElementById("employeFeedConsumedUnit").value,
        },
        feedGiven: {
          type: document.getElementById("employeFeedInput").value,
          quantity: parseFloat(
            document.getElementById("employeFeedWeight").value
          ),
          unit: document.getElementById("employeFeedUnit").value,
        },
      };

      const response = await fetch(`${apiUrl}employe-report/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'enregistrement du rapport");
      } else {
        loadUserEmployeReports();
      }

      alert("Rapport enregistré avec succès !");
      this.reset();
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de l'enregistrement du rapport");
    }
  });

// ----------------------------------------------------------------

async function loadUserEmployeReports() {
  const user = getUser();
  if (!user || !user.username) return;

  try {
    const response = await fetch(
      `${apiUrl}employe-report/user/${user.username}`
    );
    if (!response.ok)
      throw new Error("Erreur lors de la récupération des rapports");

    const data = await response.json();

    data.reports.sort((a, b) => {
      return new Date(b.visitDate) - new Date(a.visitDate);
    });

    const tbody = document.getElementById("employeReportsTableBody");
    tbody.innerHTML = "";

    for (const report of data.reports) {
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
          Consommé: ${report.feedConsumed.type}<br>
          Donné: ${report.feedGiven.type}
        </td>
        <td>
          ${report.feedConsumed.quantity} ${report.feedConsumed.unit}<br>
          ${report.feedGiven.quantity} ${report.feedGiven.unit}
        </td>
      `;

      tbody.appendChild(row);
    }

    console.log(data);
  } catch (error) {
    console.error("Erreur:", error);
  }
}

// Au chargement initial
if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  listHabitatsSelect();
  listAnimalsSelect();
  setMaxDate();
  setCurrentTime();
  loadUserEmployeReports();
} else {
  document.addEventListener("DOMContentLoaded", () => {
    listHabitatsSelect();
    listAnimalsSelect();
    setMaxDate();
    setCurrentTime();
    loadUserEmployeReports();
  });
}
