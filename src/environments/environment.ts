// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  //databaseURL: 'http://localhost:8000/api/',
  //databaseURL: 'https://website-a573c3cf.dancingapps.org/public/api/',
  databaseURL: 'https://mangabackend.uniprotec.net/api/'
  //faulty php8.2 register api
  // databaseURL: 'https://educacion.stratos360.com.mx/index.php/api/', //FAILS BECAUSE OF PHP 8.2


  /*firebaseConfig : {  //this was copilot generated
    apiKey: "AIzaSyD-7Z4Yd9bI9wZ5zQp1yfQhFp1D1W9t8mE",
    authDomain: "cursos-9f1e8.firebaseapp.com",
    projectId: "cursos-9f1e8",
    storageBucket: "cursos-9f1e8.appspot.com",
    messagingSenderId: "1026313377993",
    appId: "1:1026313377993:web:4b9d7d2a5e3c8d3c7e3b7d",
    measurementId: "G-5ZL4Z2D0T1"
  }*/

};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
