import Route from "./Route.js";
import { allRoutes, websiteName } from "./allRoutes.js";

// Création d'une route pour la page 404 (page introuvable)
const route404 = new Route("404", "Page introuvable", "/pages/404.html");

//access pages by URL secure------------------------------------------
// Fonction pour vérifier si l'utilisateur a les droits d'accès
const checkAuthorization = (route) => {
  const user = JSON.parse(sessionStorage.getItem("user"));

  // Si la route nécessite d'être déconnecté
  if (route.roles.includes("disconnected")) {
    return !user;
  }

  // Si la route nécessite d'être connecté
  if (route.roles.includes("connected")) {
    return !!user;
  }

  // Si la route nécessite un rôle spécifique
  if (
    route.roles.includes("1") ||
    route.roles.includes("2") ||
    route.roles.includes("3")
  ) {
    if (!user) return false;

    // Vérifier si l'utilisateur a le rôle requis
    return route.roles.includes(user.roleId.toString());
  }

  // Si aucun rôle n'est requis, accès autorisé
  return true;
};
//------------------------------------------

// Fonction pour récupérer la route correspondant à une URL donnée
const getRouteByUrl = (url) => {
  let currentRoute = null;
  // Parcours de toutes les routes pour trouver la correspondance
  allRoutes.forEach((element) => {
    if (element.url == url) {
      currentRoute = element;
    }
  });
  // Si aucune correspondance n'est trouvée, on retourne la route 404
  if (currentRoute != null) {
    return currentRoute;
  } else {
    return route404;
  }
};

// Fonction pour charger le contenu de la page
const LoadContentPage = async () => {
  const path = window.location.pathname;
  // Récupération de l'URL actuelle
  const actualRoute = getRouteByUrl(path);

  // access pages------------------------------------------
  // Vérification des droits d'accès
  if (!checkAuthorization(actualRoute)) {
    // Rediriger vers la page d'accueil si non autorisé
    window.location.replace("/");
    return;
  }
  //------------------------------------------

  // Récupération du contenu HTML de la route
  const html = await fetch(actualRoute.pathHtml).then((data) => data.text());
  // Ajout du contenu HTML à l'élément avec l'ID "main-page"
  document.getElementById("main-page").innerHTML = html;

  // Ajout du contenu JavaScript
  if (actualRoute.pathJS != "") {
    const scriptTag = document.createElement("script");
    scriptTag.setAttribute("type", "text/javascript");
    scriptTag.setAttribute("src", actualRoute.pathJS);
    document.querySelector("body").appendChild(scriptTag);
  }

  // Changement du titre de la page
  document.title = actualRoute.title + " - " + websiteName;

  //Afficher et masqué les éléments en fonction du rôle
  showAndHideElementsForRole();
};

//Loader page
const spinnerLoader = document.querySelector(".spinner-loader");

window.addEventListener("load", () => {
  spinnerLoader.style.opacity = 0;

  setTimeout(() => {
    spinnerLoader.style.display = "none";
  }, 300);
});

// Fonction pour gérer les événements de routage (clic sur les liens)
const routeEvent = (event) => {
  event = event || window.event;
  event.preventDefault();
  // Mise à jour de l'URL dans l'historique du navigateur
  window.history.pushState({}, "", event.target.href);
  // Chargement du contenu de la nouvelle page
  LoadContentPage();
};

// Gestion de l'événement de retour en arrière dans l'historique du navigateur
window.onpopstate = LoadContentPage;
// Assignation de la fonction routeEvent à la propriété route de la fenêtre
window.route = routeEvent;
// Chargement du contenu de la page au chargement initial
LoadContentPage();
