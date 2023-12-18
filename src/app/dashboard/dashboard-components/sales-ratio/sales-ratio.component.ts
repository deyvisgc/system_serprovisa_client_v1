import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexYAxis,
  ApexLegend,
  ApexXAxis,
  ApexTooltip,
  ApexTheme,
  ApexGrid,
  ApexPlotOptions
} from 'ng-apexcharts';
import { ProductoService } from 'src/app/component/service/producto.service';

export type salesChartOptions = {
  series: ApexAxisChartSeries | any;
  chart: ApexChart | any;
  xaxis: ApexXAxis | any;
  yaxis: ApexYAxis | any;
  stroke: any;
  theme: ApexTheme | any;
  tooltip: ApexTooltip | any;
  dataLabels: ApexDataLabels | any;
  legend: ApexLegend | any;
  colors: string[] | any;
  markers: any;
  grid: ApexGrid | any;
  plotOptions: ApexPlotOptions |any;
};

@Component({
  selector: 'app-sales-ratio',
  templateUrl: './sales-ratio.component.html'
})
export class SalesRatioComponent implements OnInit {
  @ViewChild("chart") chart: ChartComponent = Object.create(null);
  public salesChartOptions: Partial<salesChartOptions>;
  dataDefault = [
    {
      name: "2020",
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
  ]
  constructor(private producService: ProductoService, private router: Router) {
    this.construirReport(this.dataDefault)
  }

  ngOnInit(): void {
    this.getReport()
  }
  construirReport (series: any[]) {
   this.salesChartOptions = {
      series: series,
      chart: {
        fontFamily: 'Rubik,sans-serif',
        height: 265,
        type: 'bar',
        toolbar: {
          show: false
        },
        stacked: false,
      },
      dataLabels: {
        enabled: false
      },
      legend: {
        show: true,
      },
      plotOptions: {
        bar: {
          columnWidth: '50%',
          barHeight: '70%',
          borderRadius: 3,
        },
      },
      colors: ["#0d6efd", "#009efb", "#6771dc"],
      stroke: {
        show: true,
        width: 4,
        colors: ["transparent"],
      },
      grid: {
        strokeDashArray: 3,
      },
      markers: {
        size: 3
      },
      xaxis: {
        categories: [
          "ENE",
          "FEB",
          "MAR",
          "ABR",
          "MAY",
          "JUN",
          "JUL",
          "AGO",
          "SEP",
          "OCT",
          "NOV",
          "DIC"
        ],
      },
      tooltip: {
        theme: 'dark'
      }
    };
  }
  getReport() {
    this.producService.getReport().subscribe({
      next: (res: any) => {
        const groupedByYear = res.reduce((acc: any, item: any) => {
          const key = `${item.year}`;
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push({
            mes: item.mes,
            total_productos: item.total_productos,
          });
          return acc;
        }, {});
        
        // Construir el array final
        const arrayReport = Object.entries(groupedByYear).map(([year, values]) => ({
          name: year,
          data: Array.from({ length: 12 }, (_, index) =>
            ((values as { mes: number; total_productos: number }[]).find((item) => item.mes === index + 1)?.total_productos || 0)
          ),
        }));
        this.construirReport(arrayReport)
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }
}
