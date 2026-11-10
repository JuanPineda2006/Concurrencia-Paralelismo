const TOTAL = 5000000;

//Cálculo secuencial:

function calcularSecuencial(modo) {
    let suma = 0;

    log("Iniciando cálculo matemático secuencial.", "calculo");

    for (let i = 1; i <= TOTAL; i++) {
        suma += Math.sqrt(i);
    }

    actualizarPorcentaje(modo, "cpu", 100);

    log("Cálculo matemático terminado.", "exito");

    return suma;
}

//Cálculo paralelo

function calcularEnWorker(modo, cantidadWorkers) {
    const codigoWorker = `
        self.onmessage = function(event) {
            const inicio = event.data.inicio;
            const fin = event.data.fin;

            let suma = 0;

            for (let i = inicio; i <= fin; i++) {
                suma += Math.sqrt(i);
            }

            self.postMessage(suma);
        };
    `;

    const blob = new Blob(
        [codigoWorker],
        { type: "application/javascript" }
    );

    const urlWorker = URL.createObjectURL(blob);

    const tamanoSegmento = Math.ceil(TOTAL / cantidadWorkers);
    const promesas = [];

    log(
        `Dividiendo el cálculo entre ${cantidadWorkers} Web Workers.`,
        "calculo"
    );

    for (let i = 0; i < cantidadWorkers; i++) {
        const inicio = i * tamanoSegmento + 1;
        const fin = Math.min((i + 1) * tamanoSegmento, TOTAL);

        const promesa = new Promise((resolve, reject) => {
            const worker = new Worker(urlWorker);

            worker.onmessage = function(event) {
                const resultado = event.data;

                worker.terminate();
                resolve(resultado);
            };

            worker.onerror = function(event) {
                worker.terminate();
                reject(new Error(event.message || "Error en cálculo paralelo"));
            };

            worker.postMessage({ inicio, fin });
        });

        promesas.push(promesa);
    }

    return Promise.all(promesas)
        .then((resultados) => {
            const sumaTotal = resultados.reduce(
                (acumulado, valor) => acumulado + valor,
                0
            );

            actualizarPorcentaje(modo, "cpu", 100);

            log("Todos los trabajadores terminaron el cálculo.", "exito");

            return sumaTotal;
        })
        .finally(() => {
            URL.revokeObjectURL(urlWorker);
        });
}