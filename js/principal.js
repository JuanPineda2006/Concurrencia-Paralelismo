
//EJECUCIÓN SECUENCIAL

async function ejecutarSecuencial() {
    const modo = "secuencial";
    const inicio = performance.now();

    preparar(modo);

    try {
        log("Modo secuencial: comenzando las consultas.", "sistema");

        const datos = await consultarTodosSecuencial(modo);

        log("Modo secuencial: comenzando el cálculo matemático.", "calculo");

        const resultadoCPU = calcularSecuencial(modo);

        finalizar(modo, inicio, datos, resultadoCPU);

    } catch (error) {
        fallar(modo, error);
    }
}

//EJECUCIÓN CONCURRENTE

async function ejecutarConcurrente() {
    const modo = "concurrente";
    const inicio = performance.now();

    preparar(modo);

    try {
        log("Modo concurrente: iniciando las consultas.", "sistema");

        const promesaConsultas = consultarTodosConcurrente(modo);

        log("Las consultas están en curso. Comenzando el cálculo matemático.", "calculo");

        const resultadoCPU = calcularSecuencial(modo);

        log("Esperando los resultados de las consultas.", "red");

        const datos = await promesaConsultas;

        finalizar(modo, inicio, datos, resultadoCPU);

    } catch (error) {
        fallar(modo, error);
    }
}

//EJECUCIÓN PARALELA
 
async function ejecutarParalelo() {
    const modo = "paralelo";
    const inicio = performance.now();

    preparar(modo);

    try {
        log("Modo paralelo: iniciando las consultas y los cálculos.", "sistema");

        const promesaConsultas = consultasEnWorkers(modo);

        const promesaCalculo = calcularEnWorker(modo, 7);

        const [datos, resultadoCPU] = await Promise.all([promesaConsultas, promesaCalculo]);

        finalizar(modo, inicio, datos, resultadoCPU);

    } catch (error) {
        fallar(modo, error);
    }
}