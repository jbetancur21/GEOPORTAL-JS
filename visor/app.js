import Map from './ol/Map.js';
import MousePosition from './ol/control/MousePosition.js';
import BingMaps from './ol/source/BingMaps.js';
import OSM from './ol/source/OSM.js';
import TileLayer from './ol/layer/Tile.js';
import TileWMS from './ol/source/TileWMS.js';
import View from './ol/View.js';
import { createStringXY } from './ol/coordinate.js';
import { defaults as defaultControls } from './ol/control.js';





var urlParams = new URLSearchParams(window.location.search);

//Variable que indica el ID del mapa con el que se va a trabajar
const id = urlParams.get('id');

//DEFINICIÓN DE LA POSICIÓN DEL MOUSE
const mousePositionControl = new MousePosition({
    coordinateFormat: createStringXY(6),
    projection: 'EPSG:4326',
    // comment the following two lines to have the mouse position
    // be placed within the map.
    className: 'custom-mouse-position',
    target: document.getElementById('mouse-position'),
});

//DEFINICIÓN DEL SISTEMA DE COORDENADAS Y DE LA VISTA INICIAL
var vista = new View({
    projection: 'EPSG:4326',
    center: [-75.58118, 6.24011],
    zoom: 12
})

//DEFINICIÓN DEL MAPA BASE
var mapaBase = new TileLayer({
    title: 'Bing Maps',
    source: new BingMaps({
        key: 'AiYx2jJHwMagyvfJQSfgMnt-cxmbw9YZ-_0rBM4cuHM6DxvOtDb0E4-O6WlYfWNx',
        imagerySet: 'AerialWithLabels'
    })
})
//MANEJO DE LAS CAPAS QUE SE MUESTRAN
if (id === "0") {
    //PROPIEDADES DEL MAPA
    const map = new Map({
        controls: defaultControls().extend([mousePositionControl]),
        layers: [
            //Mapas Base
            mapaBase
        ],
        target: 'map',
        view: vista,
    });
} else {
    // URL de tu API
    const apiUrl = 'http://18.191.127.171:8000/mapas/' + id;
    // Obtenemos los datos de la API
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            // Creamos las capas con los datos obtenidos
            /* const layers = data.map(item => new TileLayer({
                title: item.nombre,
                source: new TileWMS({
                    projection: 'EPSG:4326',
                    attibutions: '@geoserver',
                    url: 'http://localhost:8080/geoserver/geoportal/wms',
                    params: {
                        'LAYERS': `geoportal:${item.nombre}`,
                        'TILED': true
                    },
                    serverType: 'ggeoserver'
                })
            })); */
            // Creamos las capas con los datos obtenidos
            const layers = data.map(item => new ol.layer.Vector({
                title: item.nombre,
                source: new ol.source.Vector({
                    format: new ol.format.GeoJSON(),
                    url: function (extent) {
                        return `http://ec2-18-191-127-171.us-east-2.compute.amazonaws.com:8080/geoserver/geoportal/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=geoportal%3A${item.nombre}&outputFormat=application%2Fjson`;
                        /* return `http://localhost:8080/geoserver/geoportal/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=geoportal%3A${item.nombre}&outputFormat=application%2Fjson`; */
                    }
                }),
                style: function (feature) {
                    let tipoGeometria = feature.getGeometry().getType();
                    let estilo;

                    if (tipoGeometria === 'Point') {
                        estilo = new ol.style.Style({
                            image: new ol.style.Circle({
                                radius: 5,
                                fill: new ol.style.Fill({ color: item.estilo }),
                                stroke: new ol.style.Stroke({ color: item.borde, width: 1 })
                            })
                        });
                    } else if (tipoGeometria === 'MultiLineString' || tipoGeometria === 'MultiPolygon') {
                        estilo = new ol.style.Style({
                            stroke: new ol.style.Stroke({
                                color: item.borde,
                                width: 3
                            }),
                            fill: new ol.style.Fill({
                                color: item.estilo
                            })
                        });
                    }

                    return estilo;
                }

            }));
            /*---------------------------------------- */
            var popup = new ol.Overlay.Popup({
                popupClass: "default", //"tooltips", "warning" "black" "default", "tips", "shadow",
                closeBox: true,
                onshow: function () { console.log("You opened the box"); },
                onclose: function () { console.log("You close the box"); },
                positioning: 'auto',
                autoPan: {
                    animation: { duration: 250 }
                }
            });
            /*---------------------------------------- */
            // Creamos el mapa con las capas
            const map = new Map({
                controls: defaultControls().extend([mousePositionControl]),
                layers: [
                    // Mapas Base
                    mapaBase,
                    // Capas
                    ...layers,
                ],
                target: 'map',
                view: vista,
                overlays: [popup]
            });


            /* var lswitcher = new ol.control.LayerSwitcher({
                target: $(".layerSwitcher").get(0),
            });
            map.addControl(lswitcher); */

            // Add control inside the map
            var ctrl = new ol.control.LayerSwitcher({
                //collapsed: false,
                //mouseover: true
            });
            map.addControl(ctrl);
            ctrl.on('toggle', function (e) {
                console.log('Collapse layerswitcher', e.collapsed);
            });

            // Set the control grid reference
            var search = new ol.control.SearchGPS({
                // target: $('.options').get(0)
            });
            map.addControl(search);

            // Select feature when click on the reference index
            search.on('select', function (e) {
                // console.log(e);
                map.getView().animate({
                    center: e.search.coordinate,
                    zoom: Math.max(map.getView().getZoom(), 5)
                });
            });
            /*-------POPUP------------------------ */
            // Control Select 
            var select = new ol.interaction.Select({});
            map.addInteraction(select);

            // On selected => show/hide popup
            select.getFeatures().on(['add'], function (e) {
                var feature = e.element;
                var content = "";
                var properties = feature.getProperties(); // Obtiene todas las propiedades de la característica
                for (var propiedad in properties) {
                    content += "<p><strong>" + propiedad + ":</strong> " + properties[propiedad] + "</p>";
                }
                popup.show(feature.getGeometry().getFirstCoordinate(), content);
            });
            select.getFeatures().on(['remove'], function (e) {
                popup.hide();
            })
            /*------------------------------- */




            /*Gráficas */
            $("#capasCalculos").change(function () {
                var capaGrafico = $("#capasCalculos option:selected").text();//CapasCalculos → Contiene el select con las capas del Mapa

                fetch('http://ec2-18-191-127-171.us-east-2.compute.amazonaws.com:8080/geoserver/geoportal/ows?service=WFS&version=1.0.0&request=GetFeature&typeNames=geoportal%3A' + capaGrafico.trim() + '&outputFormat=application%2Fjson')
                    .then(response => response.json())
                    .then(data => {
                        var cabeceras = Object.keys(data.features[0].properties);
                        var x = document.getElementById('graficoBarraX');
                        var y = document.getElementById('graficoBarraY');
                        //MOSTRAR LAS COLUMNAS DE CADA CAPA
                        // Vaciar las opciones existentes
                        x.innerHTML = '';
                        y.innerHTML = '';
                        // Añadir las nuevas opciones
                        cabeceras.forEach(function (cabecera) {
                            var optionX = document.createElement('option');
                            var optionY = document.createElement('option');
                            optionX.textContent = cabecera;
                            optionY.textContent = cabecera;
                            x.appendChild(optionX);
                            y.appendChild(optionY);
                        });
                    })
                    .catch(error => console.error('Error:', error));




                if (capaGrafico != "Capas...") {
                    document.getElementById('graficos').style.display = "block";
                    $("#graficos").change(function () {
                        var usoGrafico = $("#graficos option:selected").text();
                        if (usoGrafico != "Gráficos...") {

                            document.getElementById('graficoBarraX').style.display = "block";
                            document.getElementById('graficoBarraY').style.display = "block";
                            document.getElementById('labelX').style.display = "block";
                            document.getElementById('labelY').style.display = "block";

                            var columnas = {
                                'graficoBarraX': [],
                                'graficoBarraY': []
                            };

                            function fetchData(elementId) {
                                var capaGrafico = $("#capasCalculos option:selected").text();
                                return fetch('http://ec2-18-191-127-171.us-east-2.compute.amazonaws.com:8080/geoserver/geoportal/ows?service=WFS&version=1.0.0&request=GetFeature&typeNames=geoportal%3A' + capaGrafico.trim() + '&outputFormat=application%2Fjson')
                                    .then(response => response.json())
                                    .then(data => {
                                        columnas[elementId] = data.features.map(function (feature) {
                                            var graficoBarra = $("#" + elementId + " option:selected").text();
                                            return feature.properties[graficoBarra];
                                        });
                                        //alert(columnas[elementId]); // Para verificar el contenido del array
                                    })
                                    .catch(error => console.error('Error:', error));
                            }



                            var myChart = null;
                            $("#graficoBarraY").change(function () {
                                usoGrafico = $("#graficos option:selected").text();
                                var tipoChart = null;
                                if(usoGrafico=="Gráfico de Barras"){
                                    tipoChart="bar";
                                }else if(usoGrafico=="Diagrama Circular"){
                                    tipoChart="pie";
                                }else{
                                    tipoChart="bubble";
                                }

                                var x = [];
                                var y = [];
                                
                                document.getElementById('myChart').style.display = "block";
                                Promise.all([fetchData('graficoBarraX'), fetchData('graficoBarraY')]).then(() => {
                                    // Aquí puedes trabajar con columnas['graficoBarraX'] y columnas['graficoBarraY']
                                    x = columnas.graficoBarraX;
                                    y = columnas.graficoBarraY;

                                    var ctx = document.getElementById("myChart").getContext("2d");

                                    // Si myChart ya existe, lo destruimos
                                    if (myChart) {
                                        myChart.destroy();
                                    }

                                    myChart = new Chart(ctx, {
                                        type: tipoChart,
                                        data: {
                                            labels: y,
                                            datasets: [{
                                                label: 'INNTERRA',
                                                data: x
                                            }]
                                        },
                                        options: {
                                            scales: {
                                                yAxes: [{
                                                    ticks: {
                                                        beginAtZero: true
                                                    }
                                                }]
                                            }
                                        }
                                    });

                                });
                            });

                        } else {
                            document.getElementById('graficoBarraX').style.display = "none";
                            document.getElementById('graficoBarraY').style.display = "none";
                        }
                    })

                } else {
                    document.getElementById('graficos').style.display = "none";
                    document.getElementById('graficoBarraX').style.display = "none";
                    document.getElementById('graficoBarraY').style.display = "none";
                }


            });//FIN CAMBIO PRIMER INPUT

            //const graficos = data.map()








        })//FIN
        .catch(error => console.error('Error:', error));
}