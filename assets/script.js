const inputCLP = document.getElementById("inputCLP")
const botonConvertir = document.getElementById("btnConvertir")
const selectMoneda = document.getElementById("selectMoneda")
const resultado = document.getElementById("resultado")

let chartActual = null


///OBTENER DATA DE API
async function getMonedas() {
    const errorMessage = document.querySelector(".error-message")
    try {
        const apiURL = "https://mindicador.cl/api/"
        const resp = await fetch(apiURL)
        const dataMonedas = await resp.json()
        return dataMonedas
    } catch(error) {
        errorMessage.innerHTML = `
                <p>¡Algo salió mal! Error: ${error.message}</p>
            `
    }
}


///MODIFICAR DOM DE SELECT CON DATOS DE API
async function renderMonedas() {
    const monedas = await getMonedas()
    let template = ""

    const claves = ["dolar", "euro", "uf", "utm", "bitcoin"]

    for (let clave of claves) {
        const moneda = monedas[clave]
        template += `
            <option value="${clave}">${moneda.nombre}</option>
        `
    }

    selectMoneda.innerHTML = template
}


///CONVERTIR VALOR DE INPUT A VALOR DE MONEDA SELECCIONADA
async function convertirMoneda() {
    const cantidadCLP = Number(inputCLP.value)
    const claveMoneda = selectMoneda.value
    const monedas = await getMonedas()
    const monedaAConvertir = Number(monedas[claveMoneda].valor)

    const totalConvertido = (cantidadCLP / monedaAConvertir).toFixed(3)
    resultado.innerHTML = `${cantidadCLP.toLocaleString()} CLP = ${totalConvertido} ${selectMoneda.options[selectMoneda.selectedIndex].text}`

    renderGrafica(monedaAConvertir)
}


///OBTENER HISTORIAL DE MONEDA SELECCIONADA
async function getHistorial(moneda) {
    const apiHistorial = `https://mindicador.cl/api/${moneda}`
    const respHistorial = await fetch(apiHistorial)
    const dataHistorial = await respHistorial.json()

    return dataHistorial.serie.slice(0, 10).reverse()
}


///RENDERIZAR GRÁFICA DE HISTORIAL DE MONEDAS
async function renderGrafica(moneda) {
    const data = await getHistorial(moneda)
    const fechas = data.map((d) => new Date(d.fecha).toLocaleDateString())
    const valores = data.map((d) => {return d.valor})

    const config = {
        type: "line",
        data: {
            labels: fechas,
            datasets: [{
                label: "Historial últimos 10 días",
                borderColor: "red",
                data: valores,
            }]
        }
    }

    const myChart = document.getElementById("myChart")
    myChart.style.backgroundColor = "white"

    if (chartActual) {
        chartActual.destroy()
    }

    chartActual = new Chart(myChart, config)
}


///FUNCIÓN PARA CONVERTIR MONEDA Y RENDERIZAR GRÁFICA AL MISMO TIEMPO
async function ejecutarAmbasFunciones() {
    await convertirMoneda()
    const claveMoneda = selectMoneda.value
    renderGrafica(claveMoneda)
    inputCLP.value = ""
}

botonConvertir.addEventListener("click", ejecutarAmbasFunciones)

renderMonedas()