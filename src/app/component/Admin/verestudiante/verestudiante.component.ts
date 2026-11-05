import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { catchError, forkJoin } from 'rxjs';
import { Constants } from 'src/app/constants';

import jsPDF from 'jspdf';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-verestudiante',
  templateUrl: './verestudiante.component.html',
  styleUrls: ['./verestudiante.component.scss']
})
export class VerestudianteComponent implements OnInit {

  datarouted: any;
  data: any;
  cursodata: any;
  cursotimes: any;
  partialdata: any;


  namealumno: any;
  date: any;
  datestring: any;

  completed: boolean = false;

  page: number = 1;
  searchterm: string = '';

  totalQuestionsPerQuiz = [10, 5, 5, 5, 4, 3];

  q1: string = "Es regla de 0 tolerancia realizar trabajos peligrosos sin Elaborar AST.";
  q2: string = "Es valido entregar únicamente una copia de comprobante de incapacidad";
  q3: string = "3.  Realizar trabajos en Espacios Confinados y de Mantenimiento a Instalaciones Eléctricas requiere de Capacitación y AST.";
  q4: string = "4.  Es la acción u omisión del trabajador que crea un riesgo contra su seguridad y/o la de sus compañero.";
  q5: string = "5. 5. Es el estado de algo que no brinda seguridad o que supone un peligro para la gente.";
  questions = [this.q1, this.q2, this.q3, this.q4, this.q5];

  a1 = ["Verdadero", "Falso"];
  a2 = ["Verdadero", "Falso"];
  a3 = ["Verdadero", "Falso"];
  a4 = ["Acto inseguro", "Condición Insegura"];
  a5 = ["Acto inseguro", "Condición Insegura"];
  answers = [this.a1, this.a2, this.a3, this.a4, this.a5];


  // formu: FormGroup;
  form1data: FormGroup;
  form2data: FormGroup;
  form3data: FormGroup;
  form4data: FormGroup;
  form1active: boolean = false;
  form2active: boolean = false;
  form3active: boolean = false;
  form4active: boolean = false;






  constructor(private formBuilder: FormBuilder, private router: Router, private http: HttpClient,
    private router2: ActivatedRoute, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {

    this.form1data = this.formBuilder.group({});
    for (let i = 1; i <= this.questions.length; i++) {
      this.form1data.addControl(`a${i}`, new FormControl('', Validators.required));
    }

    this.form2data = this.formBuilder.group({});
    for (let i = 1; i <= this.questions.length; i++) {
      this.form2data.addControl(`a${i}`, new FormControl('', Validators.required));
    }

    this.form3data = this.formBuilder.group({});
    for (let i = 1; i <= this.questions.length; i++) {
      this.form3data.addControl(`a${i}`, new FormControl('', Validators.required));
    }

    this.form4data = this.formBuilder.group({});
    for (let i = 1; i <= this.questions.length; i++) {
      this.form4data.addControl(`a${i}`, new FormControl('', Validators.required));
    }

    if (Constants.usertype != "admin" && Constants.usertype != "superadmin") {
      this.router.navigate(['/'])
      return


    }

    this.router2.queryParams.subscribe(async (params: Params) => {

      this.datarouted = params
      console.log(this.datarouted)
      console.log(this.datarouted.name);
      //this.formu.get('id')?.setValue(this.datarouted.id);
      // console.log(this.datarouted)
      this.showcurso(this.datarouted);
      this.showResults(this.datarouted);

    });

    //this.printdiploma();
  }
  showcurso(datarouted: any) {
    this.http.get(Constants.URL + "curso/alumno/" + datarouted.id).subscribe({

      next: res => {
        //console.log(res);       
        this.cursodata = res;
        if (this.cursodata['status'] == "success") {

          this.cursodata = this.cursodata['data'];
          console.log(this.cursodata);
          this.settimes(this.cursodata);

          if (this.cursodata['time9'] !== 0 && this.cursodata['time9'] !== null) {
            this.completed = true;

            this.cdr.detectChanges(); // Manually trigger change detection
            this.printdiploma();
          }


          this.date = new Date(this.cursodata['updated_at']);
          let monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

          let formattedDate = `${this.date.getDate()} de ${monthNames[this.date.getMonth()]} ${this.date.getFullYear()}`;
          console.log(formattedDate);
          this.datestring = formattedDate;


        }
      },
      error: error => {
        console.log(error);
        window.alert("Falla de conexión: ");// + error.error.name);

      }
    });

  }

  settimes(cursodata: any) {

    this.cursotimes = [cursodata.time4, cursodata.time5, cursodata.time6, cursodata.time7, cursodata.time8, cursodata.time9];
  }

  showResults(datarouted: any) {

    // console.log(datarouted.id);
    const getRequests = [

      this.http.get(Constants.URL + "quiz1/" + datarouted.id).pipe(catchError(error => { console.log("error retrieving quiz1"); return "error" })),
      this.http.get(Constants.URL + "quiz2/" + datarouted.id).pipe(catchError(error => { console.log("error retrieving quiz2"); return "error" })),
      this.http.get(Constants.URL + "quiz3/" + datarouted.id).pipe(catchError(error => { console.log("error retrieving quiz3"); return "error" })),
      this.http.get(Constants.URL + "quiz4/" + datarouted.id).pipe(catchError(error => { console.log("error retrieving quiz4"); return "error" })),
      this.http.get(Constants.URL + "quiz5/" + datarouted.id).pipe(catchError(error => { console.log("error retrieving quiz5"); return "error" })),
      this.http.get(Constants.URL + "quiz6/" + datarouted.id).pipe(catchError(error => { console.log("error retrieving quiz6"); return "error" })),
    ]
    //);



    //  this.data = [];


    forkJoin(getRequests).subscribe(responses => {
      //this.data = ([] as object[]).concat(...responses.map(response => response as object[]));
      responses.forEach((response, index) => {
        this.partialdata = response;
        // console.log(this.partialdata);
        //this.data = this.data.concat(this.partialdata['data']);

        if (this.partialdata['status'] === 'success' && this.partialdata['data'] !== null) {

          if (this.data === undefined) {


            this.data = Array.isArray(this.partialdata['data']) ? this.partialdata['data'] : [this.partialdata['data']];
            //console.log("no data");
            // console.log(this.data);

          } else {
            this.data = this.data.concat(this.partialdata['data']);

            //console.log(this.data);
          }


          // Set form data based on index
          if (index === 0) {
            //console.log(this.form1data.value);
            this.patchform1(this.partialdata['data']);
            //console.log(this.form1data.value);
          } else if (index === 1) {
            this.patchform2(this.partialdata['data']);
            //this.form2data = this.partialdata['data'];
          } else if (index === 2) {
            this.patchform3(this.partialdata['data']);
            //this.form3data = this.partialdata['data'];
          }
          else if (index === 3) {
            this.patchform4(this.partialdata['data']);
            //this.form3data = this.partialdata['data'];
          }
          //console.log(this.data);
        }
      });
      // console.log(this.data);
    });


  }

  patchform1(formdata: any) {
    this.form1data.setValue({
      a1: formdata.a1,
      a2: formdata.a2,
      a3: formdata.a3,
      a4: formdata.a4,
      a5: formdata.a5
    });

  }

  patchform2(formdata: any) {
    this.form2data.setValue({
      a1: formdata.a1,
      a2: formdata.a2,
      a3: formdata.a3,
      a4: formdata.a4,
      a5: formdata.a5
    });

  }

  patchform3(formdata: any) {
    this.form3data.setValue({
      a1: formdata.a1,
      a2: formdata.a2,
      a3: formdata.a3,
      a4: formdata.a4,
      a5: formdata.a5
    });

  }

  patchform4(formdata: any) {
    this.form4data.setValue({
      a1: formdata.a1,
      a2: formdata.a2,
      a3: formdata.a3,
      a4: formdata.a4,
      a5: formdata.a5
    });

  }




  verRes(index: number) {
    //console.log(index);
    // console.log(this.data[index]);
    //console.log(this.form1data.value);

    if (index === 0) {
      if (this.form1active) {
        this.form1active = false;

      } else {
        this.form1active = true;
        this.form2active = false;
        this.form3active = false;
        this.form4active = false;
      }
    } else if (index === 2) {
      if (this.form3active) {
        this.form3active = false;

      } else {
        this.form3active = true;
        this.form1active = false;
        this.form2active = false;
        this.form4active = false;
      }

    } else if (index === 3) {
      if (this.form4active) {
        this.form4active = false;

      } else {
        this.form4active = true;
        this.form1active = false;
        this.form3active = false;
        this.form2active = false;
      }

    } else if (index === 1) {
      if (this.form2active) {
        this.form2active = false;

      } else {
        this.form2active = true;
        this.form1active = false;
        this.form3active = false;
        this.form4active = false;
      }

    }


  }
  incrementIndex(index: number) {
    return index + 1;
  }


  verDiploma() {

  }


  printdiploma() {

    const component = this; //to avoid confusing this. on htmlelemnt

    (document.getElementById('download') as HTMLElement).addEventListener('click', function () {
      console.log("print");
      const img = new Image();
      img.crossOrigin = "anonymous"; // This enables CORS
      img.src = '../../../assets/newslides4/DIPLOMA Magna Final (150ppp).jpg'; // Replace with the path to your image
      console.log("printafterimg");

      img.onload = () => {



        console.log("onloadimage");
        const pdf = new jsPDF('l', 'mm', [210, 297]); // A4 size page of PDF in landscape mode
        const pdfPageHeight = pdf.internal.pageSize.getHeight();
        const pdfPageWidth = pdf.internal.pageSize.getWidth();

        // Calculate the size of the image
        const imgAspectRatio = img.width / img.height;
        let width, height;

        if (imgAspectRatio > (pdfPageWidth / pdfPageHeight)) {
          // Width is the limiting factor
          width = pdfPageWidth;
          height = width / imgAspectRatio;
        } else {
          // Height is the limiting factor
          height = pdfPageHeight;
          width = height * imgAspectRatio;
        }

        // Center the image
        const x = (pdfPageWidth - width) / 2;
        const y = (pdfPageHeight - height) / 2;

        // Convert the image to a data URL
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx!.drawImage(img, 0, 0, img.width, img.height);
        const imgData = canvas.toDataURL('image/jpg', 0.4);

        // Add the image to the PDF
        pdf.addImage(imgData, 'jpg', x, y, width, height);

        // Add the text on top of the image
        pdf.setFontSize(25);


        pdf.setFont('Helvetica', 'bold');

        pdf.text(component.datarouted.name, pdfPageWidth / 2, pdfPageHeight / 1.88, { align: 'center' }); // Add the text

        pdf.setFontSize(18);
        pdf.setFont('Helvetica', 'bold');
        pdf.setTextColor(226, 46, 47);
        // Left-align the date just after "Celaya, Guanajuato a" regardless of month length
        // (centering made long months like "Noviembre" overlap the "a").
        // In the template image (1650px = 297mm) the "a" ends at ~870px => ~156.6mm; add a small gap.
        const dateX = 160;
        pdf.text(component.datestring, dateX, pdfPageHeight / 1.33, { align: 'left' }); // Add the text

        pdf.save("diplomacursoseguridadMagna.pdf");
      };
    });
  }


}
