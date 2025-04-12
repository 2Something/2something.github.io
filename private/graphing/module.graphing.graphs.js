let canvas = null;
let ctx = null;

function refreshCanvas() {
    canvas = document.querySelector('#canvas');
    canvas.remove()
    canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
    canvas.id = "canvas";
    ctx = canvas.getContext("2d");
}

export function lineplot(frequencyData) {
    refreshCanvas()

    const valueCounts = frequencyData.reduce((acc, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
    }, {});

    const chartData = [];
    const smallOffset = 0.00; // Adjust for vertical spacing

    for (const value in valueCounts) {
        const frequency = valueCounts[value];
        for (let i = 0; i < frequency; i++) {
            const offset = .003+(i*smallOffset)
            chartData.push({
                x: parseFloat(value),
                y: offset
            });
        }
    }

    const data = {
        datasets: [{
            label: 'Frequency Plot',
            data: chartData,
            backgroundColor: 'rgba(100, 149, 237, 0.7)', // Cornflower Blue
            borderColor: 'rgba(100, 149, 237, 1)',
            pointRadius: 4,
            showLine: false
        }]
    };

    const config = {
        type: 'scatter',
        data: data,
        options: {
            "responsive": false,
            "maintainAspectRatio": false,
            scales: {
                x: {
                    type: 'linear',
                    title: {
                        display: true,
                        text: 'Value'
                    },
                    ticks: {
                        stepSize: 1 // Adjust based on your number line values,
                    },
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 0.1
                    },
                    display: false // Hide y-axis labels and ticks
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        title: (context) => {
                            // Get the x-value of the hovered point
                            const xValue = context[0].parsed.x;
                            return `Value: ${xValue}`;
                        },
                        label: (_) => {
                            // You might not need a specific label for the y-position
                            return null;
                        }
                    }
                }
            }
        }
    };

    new Chart(
        ctx,
        config
    );


}

export function boxplot() {
    refreshCanvas()
    const data = {
        labels: ['Dataset 1', 'Dataset 2', 'Dataset 3'],
        datasets: [{
            label: 'Data',
            data: [
                [1, 3, 4, 5, 5, 5, 6, 7, 8, 9, 12],
                [2, 4, 5, 6, 7, 8, 8, 9, 10, 11, 12],
                [3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
            ],
            backgroundColor: ['rgba(54, 162, 235, 0.8)', 'rgba(255, 99, 132, 0.8)', 'rgba(255, 206, 86, 0.8)'],
            borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)', 'rgba(255, 206, 86, 1)'],
            borderWidth: 1
        }]
    };

    new Chart(ctx, {
        type: 'boxplot',
        data: data,
        options: {
            indexAxis: 'y', // This is the key change!
            responsive: true,
            maintainAspectRatio: true,
            title: {
                display: true,
                text: 'Horizontal Box and Whisker Plot',
                font: {
                    size: 16
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Values',
                        font: {
                            size: 14
                        }
                    },
                    beginAtZero: true
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Datasets',
                        font: {
                            size: 14
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 12
                    }
                }
            }
        }
    });
}