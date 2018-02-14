# Sentaku.io - Utilisation de firebase

Ce document sert à présenter l'utilisation de firebase pour les briques du SI Sentaku.io. Les fonctionnalités prises en charge par firebase sont les suivantes :
- Authentification
- Spécification des rôles utilisateurs
- Stockage de médias.

Avant de commencer ce document, je vous redirige vers la documentation qui est très agréable à lire et à comprendre : https://firebase.google.com/docs/web/setup .

# Démarrer
En parlant de documentation, afin de pouvoir utiliser firebase, il vous faudra suivre la partie "Getting Started" de celle-ci afin d'initialiser firebase pour votre projet. 

Vous trouverez les variables à mettre dans votre configuration dans la console de notre application , en allant sur [cette page](https://console.firebase.google.com/project/sentaku-io/authentication/users) et en cliquant sur "configuration web" en haut à droite. 

Les composants firebase dont vous avez besoin sont les suivants :
- firebase-app - Le client firebase (requis)
- firebase-auth - L'outil d'authentification
- firebase-database - La base de données firebase
- firebase-storage - Pour lire et envoyer des médias

Assurez vous d'initialiser firebase et les composants desquels nous aurons besoin (dans le window.onload dans le POC) : 

    firebase.initializeApp(firebaseConfig);
    database = firebase.database();
    storage = firebase.storage();

Et c'est tout ! Une fois ceci fait, vous n'aurez plus qu'à commencer à coder ! Nous allons présenter dorénavent certaines fonctions de base en javascript pur pour utiliser firebase. Vous devrez sans doute faire quelques recherces supplémentaires pour l'utiliser de la meilleure manière possible avec vos frameworks/langages de programmation.

# Gestion des utilisateurs
## S'inscrire et se connecter
Afin de s'inscrire, nous avons activé uniquement deux mode de connexions pour l'application sentaku-io. Ces modes de connexion sont : 
- Email/mot de passe
- Compte Google

### S'inscrire avec un couple email/mot de passe
Afin de s'inscrire avec un couple email/mot de passe, il vous suffit de récupérer la valeur de ces deux champs dans votre formulaire et d'envoyer la requête à firebase : 

    firebase.auth().createUserWithEmailAndPassword(email, password).then((user) => {
        successfulLogin();
    }).catch((error) => {
        manageError(error);
    });

C'est tout ! (Nous verrons un peu plus tard comment gérer ceci mais la requête vous connecte également à l'application !).
### Se connecter avec un couple email/mot de passe
Si s'inscrire était facile, la connexion l'est tout autant, une fois les champs email et mot de passe récupérer, la différence avec l'inscription est quasi-inexistante :

    firebase.auth().signInWithEmailAndPassword(email, password).then((user) => {
        successfulLogin();
    }).catch((error) => {
        manageError(error);
    });
### Se connecter avec un compte Google
Pour s'inscrire/se connecter avec un compte Google, il n'y a qu'une méhode à appeler. Assurez vous de créer un provider pour la connexion Google :

    googleAuthProvider = new firebase.auth.GoogleAuthProvider();
Puis, au clic d'un bouton par exemple, exécutez une fonction qui se chargera de la connexion à votre place : 

    function loginWithGoogle() {
	    //Alternatively, you could use the signInWithRedirect(googleAuthProvider); method (see the official documentation), which is recommended on mobile devices.
	    firebase.auth().signInWithPopup(googleAuthProvider).then((result) => {
	        // This gives you a Google Access Token. You can use it to access the Google API.
	        var token = result.credential.accessToken;
	        // The signed-in user info.
	        var user = result.user;
	        successfulLogin();
	    }).catch(function (error) {
	        manageError(error);
	        // You can have some more information
	        // The email of the user's account used.
	        var email = error.email;
	        // The firebase.auth.AuthCredential type that was used.
	        var credential = error.credential;
	        // ...
	    });
    }
### Se déconnecter
Rien de plus simple : appelez la fonction 

    firebase.auth().signOut().then(() => {
        console.log('The user logged out :(');
    }).catch((error) => {
        manageError(error);
    });

**Attention !!!**  Bien que vous pouvez écouter la réponse de ces requêtes dans le .then(), faire des actions à ce moment est **fortement déconseillé**. C'est pourquoi nous allons donc explorer plus en détail comment gérer l'évolution de la connexion de l'utilisateur.

## Gestion de l'évolution de l'état de l'authentifcation
Nous avons vu plus tôt que lors de la connexion, il était fortement déconseillé de gérer la connexion lors de l'appel aux différentes fonctions présentées précedemment. C'est parce que firebase nous offre une solution bien plus simple : **un observateur sur l'état de la connexion**. Il suffit donc d'écouter en permanence  cet état :

    firebase.auth().onAuthStateChanged((user) => {
        console.log('authstate changed !');
        console.log(user);
        if (user) {
            document.getElementById('logout').style.display = "block";
            //Check if the user has a role or not. If he doesn't, we should ask him or do whatever process that helps us to know his role
            checkUserPrivileges(user);
        } else {
            document.getElementById('logout').style.display = "none";
        }
    });
Vous noterez la fonction *checkUserPrivileges(user)*. Cette fonction est celle qui va nous permettre de passer à la partie suivante : gérer les rôles de nos utilisateurs. Et ceci commence par la vérification. Cette vérification a été effectuée ici dans l'observateur mais ce n'est pas obligatoire. **Mais cette vérification devra être effectuée au plus tôt.**

## Vérifier le rôle de l'utilisateur
Afin de stocker les rôles des utilisateurs, nous avons créé un bucket dans la base de données de firebase. Vous devrez donc accéder à ces données de la manière suivante :

    function checkUserPrivileges(user) {
	    //We get the vlue from the database
	    database.ref('/users/' + user.uid).once('value').then((snapshot) => {
	        role = (snapshot.val() && snapshot.val().role) || [];
	        if (role.length <= 0) {
	            console.log("Oops we don't have any role for the currently logged user");
	            presentRoleSelection(user);
	        } else {
	            console.log('Yay ! The user has the following role : ' + role);
	        }
	    })
	}
Attardons nous un peu sur cette fonction : tout d'abord, on va chercher la référence à notre objet user : 

    database.ref('/users/' + user.uid)
Vos requêtes devront **TOUJOURS** suivre cette forme **(/users/$uid)**.
Puis, nous cherchons une seule valeur avec laquelle nous allons travailler : 

    .once('value').then((snapshot) => {
        role = (snapshot.val() && snapshot.val().role) || [];
        if (role.length <= 0) {
            console.log("Oops we don't have any role for the currently logged user");
            presentRoleSelection(user);
        } else {
            console.log('Yay ! The user has the following role : ' + role);
        }
    })
De même, vous devrez **TOUJOURS** rechercher la valeur de "**role**", qui est la propriété définissant le rôle de l'utilisateur. Notez que ce rôle ne doit prendre uniquement les valeurs *evaluator, prospect, staff ou admin*. La valeur "admin" doit être vérifiée que si c'est vraiment nécessaire.

## Donner un rôle à l'utilisateur
Afin de donner un rôle à un utilisateur, cela se fait en mettant directement la base à jour :

    function updateUserObject(user, usertype) {
	    console.log("updating database... :fire:");
	    database.ref('/users/' + user.uid).set({
	        email: user.email,
	        role: usertype //, other datas.... 
	    });
	}
Encore une fois, vos requêtes devront **TOUJOURS** suivre cette forme **(/users/$uid)**. Et vous ne devrez pas accepter d'autre role que *evaluator, prospect ou staff*.

Et voilà ! Vous devriez être suffisamment armés pour pouvoir vous authentifier sur l'application !

# Gestion des fichiers
Enfin, nous allons vous présenter comment gérer les fichiers médias avec firebase. Encore une fois, c'est *très facile*

## Télécharger un fichier en amont (upload)
Afin de télécharger un fichier vers le serveur, cela se fait très facilement en utilisant un input type file en js. **Attention cependant**, les url auxquels vous téléchargerez vos fichiers devront toujours suivre le format suivant : **images/nom_du_fichier.extension** ou **videos/nom_du_fichier.extension** 

    function uploadFile() {
	    var file = document.getElementById('file').files[0];
	    //Get the root reference
	    var storeRoot = storage.ref();

	    //Create a reference to the picture : 
	    var pictureReference = storeRoot.child("images/picture.jpg");

	    //Upload from a file (Using File or Blob API):
	    pictureReference.put(file).then(() => {
	        console.log("file uploaded !");
	    });
    }
Concrètement, cette fonction va, après avoir récupéré le fichier, créer la référence de l'image (en partant de la racine). Une fois ceci fait, vous n'avez plus qu'à appeler la fonction *.put(file)* afin de lancer le téléchargement de votre fichier !

## Télécharger un fichier en aval (download)
Le fichier est téléchargé, c'est une bonne chose encore faut-il pouvoir le récupérer. C'est ce que nous allons voir maintenant. (Nous allons nous limiter au cas où nous récuperons une image pour l'afficher dans l'attribut src d'une balise img. La [documentation](https://firebase.google.com/docs/storage/web/download-files) sera plus exhaustive).
Ce cas est en fait très simple. Nous allons récupérer l'image en connaissant la référence à celle ci. Ainsi nous aurons donc une url et pourrons en faire ce que nous voulons (renvoyer l'url dans la réponse d'un web service, par exemple) :

    function loadFile() {
	    var pathReference = storage.ref('images/picture.jpg').getDownloadURL().then((url) => {
	        document.getElementById("image").src = url;
	    });
	}
