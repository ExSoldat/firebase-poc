// Initialize Firebase

var firebaseConfig = {
    apiKey: "<API_KEY>",
    authDomain: "<PROJECT_ID>.firebaseapp.com",
    databaseURL: "https://<DATABASE_NAME>.firebaseio.com",
    storageBucket: "<BUCKET>.appspot.com",
    messagingSenderId: "<SENDER_ID>",
};

var database;

window.onload = (() => {
    console.log("Hello World ! :)");

    firebase.initializeApp(firebaseConfig);
    database = firebase.database();
    storage = firebase.storage();
    //Putting the onauthStateChanger here will persist the connexion between reload
    //You can set the persistence mode using the foillowing code :
    /*
    peristence could be SESSION, LOCAL or NONE
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL) //In order to keep the auth state while the user is using his computer (closing the window will NOT close the session)
        .then(() => {
            //nothing to do i suppose
        })
        .catch((error => {
            manageError(error);
        }))
        */
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

    //---------------------Using google sign in
    googleAuthProvider = new firebase.auth.GoogleAuthProvider();
})

function signIn() {
    email = document.getElementById("email").value;
    password = document.getElementById("password").value;
    usertype = document.getElementById("usertype").value;
    console.log("signing in user with email : " + email + " | password : " + password + "| usertype : " + usertype);

    firebase.auth().createUserWithEmailAndPassword(email, password).then((user) => {
        successfulLogin();
    }).catch((error) => {
        manageError(error);
    });
}

function logIn() {
    email = document.getElementById("email").value;
    password = document.getElementById("password").value;
    console.log("login in user with email : " + email + " | password : " + password);

    firebase.auth().signInWithEmailAndPassword(email, password).then((user) => {
        successfulLogin();
    }).catch((error) => {
        manageError(error);
    });
}

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

function logOut() {
    firebase.auth().signOut().then(() => {
        console.log('The user logged out :(');
    }).catch((error) => {
        manageError(error);
    });
}

function manageError(error) {
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log('Oh no ! An error occured :(');
    console.log('Code : ' + errorCode);
    console.log(errorMessage);
}

function successfulLogin() {
    console.log('Yay ! The user is connected ! :)');
    console.log('BUT !');
    console.log("You shouldn't do it using a '.then()', for this, firebase's authentification component provides the 'onAuthStateChanged' callback");
    console.log("The .then() and .catch() will not be called in some situations were onAuthStateChanged will. (The .catch() is still useful to show error messages to the user though)");
}

//A function used to check the roles of the users
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
//If the user does not have any role : this is this PoC's role selection process 
function presentRoleSelection(user) {
    if (window.confirm("Are you a VIP ?")) {
        updateUserObject(user, "vip");
    } else {
        updateUserObject(user, "user");
    }
}

//A function used to update the user variable
function updateUserObject(user, usertype) {
    console.log("updating database... :fire:");
    database.ref('/users/' + user.uid).set({
        email: user.email,
        role: usertype //, other datas.... 
    });
}

//Uploading files : 
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

function loadFile() {
    var pathReference = storage.ref('images/picture.jpg').getDownloadURL().then((url) => {
        document.getElementById("image").src = url;
    });
}