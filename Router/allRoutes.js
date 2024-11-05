import Route from "./Route.js"

//Définir ici vos routes
export const allRoutes = [
    new Route("/", "Accueil", "/pages/home.html", "./js/habitat.js", []),
    new Route("/services", "Services", "/pages/services.html", []),
    new Route("/habitat", "Habitats", "/pages/habitat.html", "./js/animal.js", [],),
    new Route("/contact", "Contact", "/pages/contact.html", "./js/auth/contact.js", ["disconnected"]),
    new Route("/signin", "Connexion", "/pages/signin.html", "./js/auth/signin.js", ["disconnected"]),
    new Route("/signup", "Inscription", "/pages/signup.html", "./js/auth/signup.js", ["1"]),
];

//Le titre s'affiche comme ceci : Route.titre - websitename
export const websiteName = "Zoo Arcadia"