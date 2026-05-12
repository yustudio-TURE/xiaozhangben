var Charts = (function() {
  'use strict';

  var pieChart = null;
  var barChart = null;

  function destroyAll() {
    if (pieChart) { pieChart.destroy(); pieChart = null; }
    if (barChart) { barChart.destroy(); barChart = null; }
  }

  function renderPie(canvasId, records) {
    var ctx = document.getElementById(canvasId);
    if (!ctx) return;
    destroyAll();

    var cats = {};
    var total = 0;
    records.forEach(function(r) {
      cats[r.category] = (cats[r.category] || 0) + r.amount;
      total += r.amount;
    });

    var labels = Object.keys(cats);
    var data = Object.values(cats);
    var icons = {};
    labels.forEach(function(c) { icons[c] = Classifier.getIcon(c); });

    var colors = ['#FF9500','#007AFF','#FF3B30','#34C759','#FFCC00','#FF6482','#5856D6','#8E8E93'];
    if (labels.length === 0) {
      labels = ['暂无数据'];
      data = [1];
    }

    pieChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 16,
              usePointStyle: true,
              font: { size: 13 },
              generateLabels: function(chart) {
                var ds = chart.data.datasets[0];
                return chart.data.labels.map(function(label, i) {
                  var icon = icons[label] || '';
                  return {
                    text: icon + ' ' + label + '  ¥' + (ds.data[i] || 0).toFixed(2),
                    fillStyle: ds.backgroundColor[i],
                    strokeStyle: ds.backgroundColor[i],
                    lineWidth: 0,
                    hidden: false,
                    index: i,
                    pointStyle: 'circle'
                  };
                });
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(ctx) {
                var val = ctx.parsed;
                var pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
                return '¥' + val.toFixed(2) + ' (' + pct + '%)';
              }
            }
          }
        }
      }
    });
  }

  function renderBar(canvasId, records, mode, year, month) {
    var ctx = document.getElementById(canvasId);
    if (!ctx) return;
    if (barChart) { barChart.destroy(); barChart = null; }

    var labels, values, label;

    if (mode === 'month') {
      var daysInMonth = new Date(year, month, 0).getDate();
      labels = [];
      values = [];
      for (var d = 1; d <= daysInMonth; d++) {
        var dd = (d < 10 ? '0' : '') + d;
        labels.push(dd + '日');
        values.push(0);
      }

      var prefix = year + '-' + (month < 10 ? '0' + month : month);
      records.forEach(function(r) {
        if (r.date.slice(0, 7) === prefix) {
          var day = parseInt(r.date.slice(8, 10), 10) - 1;
          values[day] += r.amount;
        }
      });
      label = year + '年' + month + '月 每日支出';
    } else {
      var MONTHS = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
      labels = MONTHS;
      values = new Array(12).fill(0);
      records.forEach(function(r) {
        if (r.date.slice(0, 4) === String(year)) {
          var m = parseInt(r.date.slice(5, 7), 10) - 1;
          values[m] += r.amount;
        }
      });
      label = year + '年 每月支出';
    }

    barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: label,
          data: values,
          backgroundColor: values.map(function(v) {
            return v > 0 ? 'rgba(0,122,255,0.7)' : 'rgba(0,122,255,0.1)';
          }),
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(ctx) { return '¥' + ctx.parsed.y.toFixed(2); }
            }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 } } },
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(v) { return '¥' + v; },
              font: { size: 11 }
            },
            grid: { color: '#F2F2F7' }
          }
        }
      }
    });
  }

  return {
    destroyAll: destroyAll,
    renderPie: renderPie,
    renderBar: renderBar
  };
})();
