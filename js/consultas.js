const POKEMON = ["pikachu", "charizard", "bulbasaur", "squirtle", "gengarthd", "lucario", "mewtwo", "greninja"];

const API_URL = "https://pokeapi.co/api/v2/pokemon/";

async function consultar(nombre) {
    const respuesta = await fetch(`${API_URL}${nombre}`);

    if (!respuesta.ok) {
        throw new Error(`Error al consultar ${nombre}: HTTP ${respuesta.status}`);
    }

    const datos = await respuesta.json();

    return {nombre: datos.name, experiencia: datos.base_experience, altura: datos.height, peso: datos.weight};
}

//Consultas secuenciales:

async function consultarTodosSecuencial(modo) {
    const resultados = [];

    for (const nombre of POKEMON) {
        try {
            resultados.push(await consultar(nombre));
        } catch (error) {
            resultados.push(null);
        }
        actualizarPorcentaje(modo, "net", (resultados.length/POKEMON.length) * 100);
    }

    return resultados;
}

//Consultas concurrentes

async function consultarTodosConcurrente(modo) {
    let completadas = 0;

    const solicitudes = POKEMON.map(async (nombre) => {
        try {
            return await consultar(nombre);
        } catch (error) {
            return null;
        } finally {
            completadas++;
            actualizarPorcentaje(modo, "net", (completadas / POKEMON.length) * 100);
        }
    });

    return await Promise.all(solicitudes);
}

//Consultas mediante Web Workersd 

function consultasEnWorkers(modo) {
    console.log("Pokémon recibidos:", POKEMON);
    console.log("Cantidad de consultas:", POKEMON.length);

    const codigoWorker = `
        self.onmessage = async function(event) {
            const nombre = event.data.nombre;

            try {
                const respuesta = await fetch(
                    "https://pokeapi.co/api/v2/pokemon/" + nombre
                );

                if (!respuesta.ok) {
                    throw new Error("HTTP " + respuesta.status);
                }

                const datos = await respuesta.json();

                self.postMessage({
                    correcto: true,
                    resultado: {
                        nombre: datos.name,
                        experiencia: datos.base_experience,
                        altura: datos.height,
                        peso: datos.weight
                    }
                });
            } catch (error) {
                self.postMessage({
                    correcto: false,
                    error: error.message
                });
            }
        };
    `;

    const blob = new Blob(
        [codigoWorker],
        { type: "application/javascript" }
    );

    const urlWorker = URL.createObjectURL(blob);

    const promesas = POKEMON.map((nombre) => {
         console.log("Creando Worker para:", nombre);
        return new Promise((resolve, reject) => {
            const worker = new Worker(urlWorker);

            log(`Worker iniciado para ${nombre}.`, "red");

            worker.onmessage = function(event) {
                worker.terminate();

                if (event.data.correcto) {
                    log(`Worker terminó la consulta de ${nombre}.`, "exito");
                    resolve(event.data.resultado);
                } else {
                    log(`Error consultando ${nombre}: ${event.data.error}`, "error");
                    reject(new Error(event.data.error));
                }
            };

            worker.onerror = function(event) {
                worker.terminate();
                reject(new Error(event.message || "Error en Web Worker"));
            };

            worker.postMessage({ nombre });
        });
    });

    return Promise.all(promesas.map(p => p.catch(() => null)))
        .then((resultados) => {
            actualizarPorcentaje(modo, "net", 100);
            return resultados;
        })
        .finally(() => {
            URL.revokeObjectURL(urlWorker);
        });
}