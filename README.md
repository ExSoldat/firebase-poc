Installation : Start by install the firebase-cli : 

npm install -g firebase-tools

Then add to your main html page the following :

    <script src="https://www.gstatic.com/firebasejs/4.9.1/firebase.js"></script>
    <!-- This will add all firebase components -->
    <!-- You can also add the components one by one, depending on your needs: -->
    <script src="https://www.gstatic.com/firebasejs/4.9.1/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/4.9.1/firebase-auth.js"></script>
    <!-- Instead of adding firebase here, if you use a bundler like Browserify or webpack and you installed firebase-cli, 
        you can juste require the components you will use
        e.g: var firebase = require("firebase/app"); require("firebase/auth"); etc...-->


Then yo need to generate yout firebase.json file:

In order to do so, you just have to use the cli :

firebase init

If you need more connection modes (The currently available are email/password, google account, facebook account and github account), please ask us