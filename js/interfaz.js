function log(mensaje, tipo = "sistema") {
    const lista = document.getElementById("log");
    const elemento = document.createElement("li");
    const hora = new Date().toLocaleTimeString();

    elemento.className = tipo;
    elemento.textContent = `[${hora}] ${mensaje}`;

    lista.appendChild(elemento);
    lista.scrollTop = lista.scrollHeight;
}

function limpiarLog() {
    document.getElementById("log").innerHTML = "";
    log("Registro de eventos limpiado.", "sistema");
}

function barra(modo, porcentaje) {
    const valor = Math.max(0, Math.min(100, porcentaje));

    document.getElementById(`bar-${modo}`).style.width =
        `${valor}%`;
}

function actualizarPorcentaje(modo, tarea, porcentaje) {
    const valor = Math.max(0, Math.min(100, porcentaje));

    document.getElementById(`${tarea}-${modo}`).textContent = `${Math.round(valor)}%`;

    const red = Number(document.getElementById(`net-${modo}`).textContent.replace("%", ""));

    const cpu = Number(document.getElementById(`cpu-${modo}`).textContent.replace("%", ""));

    barra(modo, (red + cpu) / 2);
}

function estado(modo, mensaje) {
    document.getElementById(`status-${modo}`).textContent = mensaje;
}

function preparar(modo) {
    const boton = document.getElementById(`btn-${modo}`);

    boton.disabled = true;

    estado(modo, "Ejecutando...");
    barra(modo, 0);

    actualizarPorcentaje(modo, "net", 0);
    actualizarPorcentaje(modo, "cpu", 0);

    document.getElementById(`netresult-${modo}`).textContent ="En ejecución";

    document.getElementById(`cpuresult-${modo}`).textContent ="En ejecución";

    document.getElementById(`time-${modo}`).textContent = "--";

    log(`Inicio de la ejecución ${modo}.`, "sistema");
}

function finalizar(modo, inicio, datos, resultadoCPU) {
    const tiempo = ((performance.now() - inicio) / 1000).toFixed(2);

    actualizarPorcentaje(modo, "net", 100);
    actualizarPorcentaje(modo, "cpu", 100);
    barra(modo, 100);

    estado(modo, "Finalizado correctamente");

    const exitosas = datos.filter(dato => dato !== null).length;
    const fallidas = datos.length - exitosas;

    document.getElementById(`netresult-${modo}`).textContent = `${exitosas} exitosas / ${fallidas} fallidas`;

    document.getElementById(`cpuresult-${modo}`).textContent = resultadoCPU.toLocaleString("es-CO", {maximumFractionDigits: 2});

    document.getElementById(`time-${modo}`).textContent =`${tiempo} s`;

    document.getElementById(`btn-${modo}`).disabled = false;

    log(`Ejecución ${modo} terminada en ${tiempo} segundos.`, "exito");
}

function fallar(modo, error) {
    estado(modo, "Se produjo un error");
    document.getElementById(`btn-${modo}`).disabled = false;

    log(`Error en ${modo}: ${error.message || error}`, "error");
}