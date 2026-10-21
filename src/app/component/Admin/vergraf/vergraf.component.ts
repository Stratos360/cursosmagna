import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { catchError, forkJoin, of } from 'rxjs';
import { Constants } from 'src/app/constants';

interface QuizChart {
  title: string;
  data: ChartConfiguration<'bar'>['data'];
}

@Component({
  selector: 'app-vergraf',
  templateUrl: './vergraf.component.html',
  styleUrls: ['./vergraf.component.scss'],
})
export class VergrafComponent implements OnInit {

  // Answer keys, one per quiz endpoint (quiz1..quiz6). Keep in sync with the
  // correctAnswers of the quiz components (c14p4c, c02p5c, c03cuest, c042-c, curso5c, curso6c).
  // The number of questions of each quiz is the length of its key.
  readonly correctAnswers: string[][] = [
    ["1", "2", "1", "1", "2", "1", "1", "2", "3", "2"], // quiz1 (c14p4c)
    ["2", "2", "3", "1", "2"],                          // quiz2 (c02p5c)
    ["2", "1", "2", "2", "2"],                          // quiz3 (c03cuest)
    ["2", "1", "1", "2", "2"],                          // quiz4 (c042-c)
    ["2", "2", "1", "3"],                               // quiz5 (curso5c)
    ["2", "1", "1"],                                    // quiz6 (curso6c)
  ];

  quizCharts: QuizChart[] = this.correctAnswers.map((key, i) => ({
    title: `Cuestionario ${i + 1}`,
    data: this.buildChartData(key.map(() => 0), key.map(() => 0)),
  }));

  barChartLegend = true;
  barChartPlugins = [];

  barChartOptions: ChartOptions<'bar'> = {
    responsive: false,
    scales: {
      x: { stacked: true },
      y: { stacked: true, ticks: { precision: 0 } }
    }
  };

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.getdatas();
  }

  private buildChartData(correct: number[], wrong: number[]): ChartConfiguration<'bar'>['data'] {
    return {
      labels: correct.map((_, i) => `Pregunta ${i + 1}`),
      datasets: [
        {
          data: correct,
          label: 'Correcta',
          borderColor: 'black',
          backgroundColor: 'rgba(80,122,78,0.3)'
        },
        {
          data: wrong,
          label: 'Error',
          borderColor: 'black',
          backgroundColor: 'rgba(255,0,0,0.3)'
        }
      ]
    };
  }

  // Each row holds the option chosen by the student in a1..aN (stored as "1", "2", ...),
  // so it is compared against the answer key. Rows without a value for a question (e.g. quiz 1
  // submissions from before it had 10 questions) are skipped for that question.
  processData(rows: any[], key: string[]): { correct: number[], wrong: number[] } {
    const correct: number[] = [];
    const wrong: number[] = [];
    key.forEach((answer, i) => {
      const answered = rows
        .map(row => row[`a${i + 1}`])
        .filter(value => value !== null && value !== undefined && value !== '');
      const right = answered.filter(value => String(value) === answer).length;
      correct.push(right);
      wrong.push(answered.length - right);
    });
    return { correct, wrong };
  }

  getdatas() {
    // A failing quiz request must not blank the other charts.
    const requests = this.correctAnswers.map((_, i) =>
      this.http.get<any>(Constants.URL + `quiz${i + 1}`).pipe(
        catchError(error => {
          console.log(error);
          return of(null);
        })
      )
    );

    forkJoin(requests).subscribe(responses => {
      if (responses.every(res => res === null)) {
        window.alert("Falla de conexión");
        return;
      }

      // New objects (not in-place mutation) so ng2-charts picks up the change.
      this.quizCharts = this.quizCharts.map((chart, i) => {
        const res = responses[i];
        if (res?.status !== 'success' || !Array.isArray(res.data)) {
          return chart;
        }
        const { correct, wrong } = this.processData(res.data, this.correctAnswers[i]);
        return { ...chart, data: this.buildChartData(correct, wrong) };
      });
    });
  }
}
