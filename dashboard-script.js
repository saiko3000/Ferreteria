document.addEventListener('DOMContentLoaded', () => {
    // === Elementos del DOM ===
    const dailySalesTotalElement = document.getElementById('daily-sales-total');
    const weeklySalesTotalElement = document.getElementById('weekly-sales-total');
    const recentSalesBody = document.getElementById('recent-sales-body');
    const weeklySalesChartCtx = document.getElementById('weeklySalesChart').getContext('2d');
    const generateReportBtn = document.getElementById('generate-report-btn');
    const totalSalesCountElement = document.getElementById('total-sales-count');

    // === Simulación de Datos (En un entorno real, esto vendría de una API o BD) ===
    const generateRandomSales = (days = 30) => {
        const salesData = [];
        const today = new Date();
        for (let i = 0; i < days; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const numSales = Math.floor(Math.random() * 8) + 3; // 3 a 10 ventas por día
            for (let j = 0; j < numSales; j++) {
                const total = parseFloat((Math.random() * 100 + 10).toFixed(2)); // $10 a $110
                const hour = Math.floor(Math.random() * 24);
                const minute = Math.floor(Math.random() * 60);
                salesData.push({
                    id: `${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}-${j}`,
                    date: date.toISOString().split('T')[0],
                    time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
                    total: total
                });
            }
        }
        return salesData.sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`));
    };

    const allSales = generateRandomSales(30);

    // === Funciones del Panel ===

    // 1. Mostrar Resumen de Ventas y el Contador
    const displaySummary = () => {
        const today = new Date().toISOString().split('T')[0];
        let dailyTotal = 0;
        let weeklyTotal = 0;
        const totalSalesCount = allSales.length;

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        allSales.forEach(sale => {
            if (sale.date === today) {
                dailyTotal += sale.total;
            }
            if (new Date(sale.date) >= oneWeekAgo) {
                weeklyTotal += sale.total;
            }
        });

        dailySalesTotalElement.textContent = `$${dailyTotal.toFixed(2)}`;
        weeklySalesTotalElement.textContent = `$${weeklyTotal.toFixed(2)}`;
        totalSalesCountElement.textContent = totalSalesCount;
    };

    // 2. Mostrar Últimas 10 Ventas
    const displayRecentSales = () => {
        recentSalesBody.innerHTML = '';
        const recent10Sales = allSales.slice(0, 10);

        recent10Sales.forEach(sale => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${sale.id}</td>
                <td>${sale.date}</td>
                <td>${sale.time}</td>
                <td>$${sale.total.toFixed(2)}</td>
            `;
            recentSalesBody.appendChild(row);
        });
    };

    // 3. Generar Gráfico de Ventas Semanales
    const generateWeeklyChart = () => {
        const salesByDay = {};
        const today = new Date();
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - (6 - i));
            const dateString = date.toISOString().split('T')[0];
            salesByDay[dateString] = 0;
        }

        allSales.forEach(sale => {
            if (salesByDay.hasOwnProperty(sale.date)) {
                salesByDay[sale.date] += sale.total;
            }
        });

        const sortedDates = Object.keys(salesByDay).sort((a, b) => new Date(a) - new Date(b));
        const labels = sortedDates.map(dateString => {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', { weekday: 'short', month: 'short', day: 'numeric' });
        });
        const data = sortedDates.map(dateString => salesByDay[dateString].toFixed(2));

        new Chart(weeklySalesChartCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Ventas Diarias ($)',
                    data: data,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Total de Ventas ($)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Día de la Semana'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Ventas: $${context.parsed.y.toFixed(2)}`;
                            }
                        }
                    }
                }
            }
        });
    };

    // 4. Función de Generar Reporte (simulada)
    generateReportBtn.addEventListener('click', () => {
        alert("¡Reporte generado con éxito! (Esta es una simulación. En un sistema real, se descargaría un archivo PDF o Excel).");
        console.log("Datos para el reporte:", allSales);
    });

    // === Inicialización del Panel ===
    displaySummary();
    displayRecentSales();
    generateWeeklyChart();
});