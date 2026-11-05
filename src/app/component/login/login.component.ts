import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Constants } from 'src/app/constants';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public ff: FormGroup = new FormGroup({});
  public loginsubmitted: Boolean = false;
  public successdata: any;

  constructor(private fb: FormBuilder, private router: Router, private htt: HttpClient) { }

  ngOnInit(): void {

    this.ff = this.fb.group({
      email: ['', Validators.required],  //was username....
      password: ['', Validators.required],
    })
  }


  onLogoutSubmit() {

    return this.htt.post(Constants.URL + "Logout", this.loginsubmitted/*,{ headers: { Authorization:localStorage.getItem('token') } }*/).subscribe((res) => {
      this.successdata = res;

      if (this.successdata['status'] == "success") {
        window.alert("Usuario " + sessionStorage['name'] + " cerró sesion");    //WAS sstorage.name before
        localStorage.clear();
        sessionStorage.clear();
        //this.successdata['data']['name']+" has been Login successfully");
      }
      else {
        console.log(res);
        sessionStorage.clear();   //regardless?? ? //Frontend validation primero, no importa que siga validado en server
      }

      //window.alert("unknown erorr at lougout");

    });
  }




  onLoginSubmit(logindata: any) {

    console.log(logindata);
    return this.htt.post(Constants.URL + "Login", logindata).subscribe((res) => {
      this.successdata = res;
      // let resp:any = res;

      console.log(res);

      if (this.successdata['status'] == "success") {
        window.alert("Bienvenido " + this.successdata['data']['name'] + " a la plataforma MAGNA");

        //TODO delete user: once the backend with Sanctum login is deployed, read the new token here:
        //let token = this.successdata['data']['token'] ?? this.successdata['data']['access_token'];  //Sanctum sends "token"
        let token = this.successdata['data']['access_token'];  //was res but cant be used like this anymopre
        localStorage.setItem("access_token", token);//already set on authintercept//'Bearer ' +token);

        sessionStorage.setItem("name", this.successdata['data']['name']);

        //console.log( this.successdata['payload'])
        Constants.userId = this.successdata['data']['id'];
        Constants.session = true;
        Constants.usertype = this.successdata['data']['type'];

        //console.log(Constants.usertype)
        // sessionStorage.setItem("session","true");                       //experimental sess
        //sessionStorage.setItem("usertype",this.successdata['payload']['usertype']); 

        //AppComponent.myapp.usertype = this.successdata['payload']['usertype'];



        if (Constants.usertype == "admin" || Constants.usertype == "superadmin") {
          sessionStorage.setItem('isGuest', 'false');

          // localStorage.setItem("cursos",this.successdata['data']['currentcurso']);   
          this.router.navigate(['/adminmenu'],);
        } else {
          //this.router.navigate(['/menumodulo']);
          localStorage.setItem("cursos", this.successdata['data']['currentcurso']);
          sessionStorage.setItem('isGuest', 'false');
          this.router.navigate(['/menumodulo']);
        }
        // console.log(Constants.usertype)



      } else if (this.successdata['status'] == "error") {
        console.log("ERROR no coinciden")
        window.alert(this.successdata['mensaje']);//"Datos de login incorrectos");
        /* Swal.fire({
         title: 'OPPS!!',
         text:   "Login details are not coreect.",
         icon: 'error'
       });*/
      } else {
        window.alert("unknown BUG");
      }

      //


    },
      error => {
        window.alert("Error de conexión");   //error.message);
        console.log(error);
      }

    );
  }

  EntrarGuest() {
    sessionStorage.setItem('isGuest', 'true');
    this.router.navigate(['/menumodulo']);

  }

  GotoRegister() {
    this.router.navigate(['/registrarse']);
  }
  GotoRecover() {
    this.router.navigate(['/recoverpass']);
  }

}