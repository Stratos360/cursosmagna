import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Constants } from 'src/app/constants';
import { FilterpipePipe } from 'src/app/service/filterpipe.pipe';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver'; //install types ??

@Component({
  selector: 'app-listaestudiantes',
  templateUrl: './listaestudiantes.component.html',
  styleUrls: ['./listaestudiantes.component.scss']
})
export class ListaestudiantesComponent implements OnInit {

  data:any;
  rows: any[] = []; //what the table shows; data keeps everyone for the Excel export
  cursodata:any;
  finishedAt: {[idalumno: number]: string} = {}; //latest passed quiz6 per student
  cycleYear: string = ''; //year of the newest completion, so it rolls over with each batch

  page: number=1;
  searchterm:string='';
  view: string='finished';
  Constants = Constants;

  constructor(private _http: HttpClient,private router:Router) { }

  ngOnInit(): void {

    
    if(Constants.usertype!="admin" && Constants.usertype != "superadmin"){
      this.router.navigate(['/'])
      return
    }
    
    this._http.get(Constants.URL+"alumno").subscribe({
      
      next: res=> {
        //console.log(res);       
        this.data= res ;
        if(this.data['status'] == "success"){

          this.data = this.data['data'];
          console.log(this.data);  

          this.data.forEach((item:any) => {
            item.created_at = item.created_at.substring(0, 16).replace('T', ' ');
          });
          this.applyFinished();
        }
    },
    error:error=>{
      console.log(error);
      window.alert("Falla de conexión: ");// + error.error.name);

    }
    });

    //quiz6 is the last quiz and only saved when passed, so its date is the completion date.
    //cursos can't tell: currentcurso/time9 are reset to -1/NULL when a student retakes the course.
    this._http.get(Constants.URL+"quiz6").subscribe({
      next: (res:any)=> {
        if(res['status'] == "success"){
          res['data'].forEach((quiz:any) => {
            const date = quiz.created_at.substring(0, 16).replace('T', ' ');
            if(!this.finishedAt[quiz.idalumno] || date > this.finishedAt[quiz.idalumno]){
              this.finishedAt[quiz.idalumno] = date;
            }
          });
          this.applyFinished();
        }
      },
      error: error=>{
        console.log(error);
        window.alert("Falla de conexión: no se pudieron cargar los cursos terminados");
        this.view = 'all'; //an empty "terminados" list would look like nobody finished
        this.applyFinished();
      }
    });

    this._http.get(Constants.URL+"curso").subscribe({
      
      next: res=> {
        //console.log(res);       
        this.cursodata= res ;
        if(this.cursodata['status'] == "success"){

          this.cursodata = this.cursodata['data'];
          //console.log(this.cursodata);  

          this.cursodata.forEach((item:any) => {
            item.created_at = item.created_at.substring(0, 16).replace('T', ' ');
          });
        }
    },
    error:error=>{
      console.log(error);
      window.alert("Falla de conexión: ");// + error.error.name);
      
    }
    });
   
  }

  //alumno and quiz6 load independently, so this runs after each one
  applyFinished(){
    if(!Array.isArray(this.data)) return;

    this.data.forEach((item:any) => {
      item.finished_at = this.finishedAt[item.id] ?? null;
    });

    this.data = [...this.data].sort((a:any, b:any) =>
      (b.finished_at ?? '').localeCompare(a.finished_at ?? '') || this.byRegistered(a, b));
    this.cycleYear = this.data[0]?.finished_at?.substring(0, 4) ?? '';
    this.applyView();
  }

  applyView(){
    this.rows = this.view == 'finished'
      ? this.data.filter((item:any) => item.finished_at?.startsWith(this.cycleYear))
      : [...this.data].sort(this.byRegistered);
  }

  private byRegistered = (a:any, b:any) => b.created_at.localeCompare(a.created_at) || b.id - a.id;

  verquiz(equipo: any){
    console.log(equipo)
    this.router.navigate(['/verquiz'],{
      queryParams:{
        id:equipo.id,
        name:equipo.name,
        email:equipo.email
      }
    })

  }


  eliminar(alumno: any){
    if(alumno.id == Constants.userId){
      window.alert("No puedes eliminar tu propia cuenta");
      return;
    }

    if(!window.confirm("¿Eliminar a " + alumno.name + " (" + alumno.email + ")? Se borrarán también sus cursos y resultados. Esta acción no se puede deshacer.")){
      return;
    }

    //AuthtokenService is not registered as interceptor, so send the Sanctum token here
    const headers = { Authorization: 'Bearer ' + localStorage.getItem('access_token') };

    this._http.delete(Constants.URL+"alumno/"+alumno.id, { headers }).subscribe({
      next: (res:any)=> {
        if(res['status'] == "success"){
          this.data = this.data.filter((item:any) => item.id !== alumno.id);
          this.applyView();
          if(this.cursodata){
            this.cursodata = this.cursodata.filter((item:any) => item.idalumno !== alumno.id);
          }
        }
        window.alert(res['mensaje']);
      },
      error: error=>{
        console.log(error);
        if(error.status == 401){
          window.alert("Sesión expirada, vuelve a iniciar sesión");
        } else if(error.status == 403){
          window.alert("No tienes permiso para eliminar usuarios");
        } else {
          window.alert("Falla de conexión");
        }
      }
    });
  }

  exportToExcel(): void {
    // Create a new workbook
  const wb: XLSX.WorkBook = XLSX.utils.book_new();

  // Create the first worksheet from this.data
  const ws1: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.data);
  XLSX.utils.book_append_sheet(wb, ws1, 'Students');

  // Create the second worksheet from this.cursodata
  const ws2: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.cursodata);
  XLSX.utils.book_append_sheet(wb, ws2, 'CoursesTimes');

  console.log(this.data);
  console.log(this.cursodata);
  
    // Filter this.data based on currentcurso = 9 in this.cursodata
    /*
    const filteredData = this.data.filter((user:any) => {
      const curso = this.cursodata.find((curso:any) => curso.idalumno === user.id);
      return curso && curso.currentcurso === 9;
    });*/
    const filteredData = this.data.map((user: any) => {
      const curso = this.cursodata.find((curso: any) => curso.idalumno === user.id && curso.currentcurso === 9);
      if (curso) {
        return {
          ...user,
          currentcurso: curso.currentcurso,
          time1: curso.time1,
          time2: curso.time2,
          time3: curso.time3,
          time4: curso.time4,
          time5: curso.time5,
          time6: curso.time6,
          time7: curso.time7,
          time8: curso.time8,
          time9: curso.time9,
          updated_at: curso.updated_at
        };
      }
      return null;
    }).filter((user: any) => user !== null);

     // Create the third worksheet from filteredData
  const ws3: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);
  XLSX.utils.book_append_sheet(wb, ws3, 'Pasantes');
  
    // Write the workbook and save it
    const wbout: Blob = new Blob([XLSX.write(wb, {bookType: 'xlsx', type: 'array'})], {type: 'application/octet-stream'});
    saveAs(wbout, 'StudentData.xlsx');
  }

  }


