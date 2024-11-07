function listAnimalsSelect(habitatId = null) {

    const animalSelect = document.getElementById("animalSelect");
    // Désactiver le select animal si aucun habitat n'est sélectionné
    if (!habitatId) {
        animalSelect.disabled = true;
        animalSelect.innerHTML = '<option value="">Sélectionnez d\'abord un habitat</option>';
        return;
    } else {    
        // Activer le select animal
        animalSelect.disabled = false;

        fetch(apiUrl + "animal/list")
            .then(response => {
                if (!response.ok) throw new Error("Erreur réseau: " + response.status);
                return response.json();
            })
            .then(animals => {
                if (!animalSelect) {
                    console.error("Select Animal non trouvé");
                    return;
                } else {
                    // Réinitialiser le select
                    animalSelect.innerHTML = '<option value="">Choisir un animal</option>';
                    // Filtrer les animaux de l'habitat sélectionné et les trier par ordre alphabétique
                    const filteredAnimals = animals
                        .filter(animal => animal.habitat.id === parseInt(habitatId))
                        .sort((a, b) => a.firstName.localeCompare(b.firstName, 'fr'));

                    // Ajouter les options pour chaque animal filtré
                    filteredAnimals.forEach(animal => {
                    const option = document.createElement("option");
                    option.value = animal.id;
                    option.textContent = animal.firstName + " - " + animal.race.label;
                    animalSelect.appendChild(option);
                    });
                }
            })
            .catch(error => {
                console.error("Erreur lors du chargement des animaux:", error);
            });
    }
}


// Ajouter un écouteur d'événements sur le select d'habitat
document.getElementById("habitatAnimalSelect").addEventListener("change", (e) => {
    listAnimalsSelect(e.target.value);
});

// Au chargement initial
if (document.readyState === "complete" || document.readyState === "interactive") {
    listHabitatsSelect();
    listAnimalsSelect();
} else {
    document.addEventListener("DOMContentLoaded", () => {
        listHabitatsSelect();
        listAnimalsSelect();
    });
}