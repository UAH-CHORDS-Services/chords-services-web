/**
 * Created by ssahani on 4/15/15.
 */
var sensorSource = new ol.source.Vector({
    features: sensorList //add an array of features
});

var sensorIconStyle = new ol.style.Style({
    image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        anchor: [0.5, 22],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        opacity: 1,
        src: 'sensor.png'
    }))
});


var sensorLayer = new ol.layer.Vector({
    title: 'Sensor Clickables',
    source: sensorSource,
    style: sensorIconStyle
});

(function() {
    var currentdate = new Date();

    var month = currentdate.getMonth();
    if(month < 10)
        month = "0" + month;
    var day = currentdate.getDate();
    if(day < 10)
        day = "0" + day;
    var hour = currentdate.getHours();
    if(hour < 10)
        hour = "0" + hour;

    var datetime = currentdate.getFullYear() + "-" + month + "-" + day + "T" +
            hour;
    if(currentdate.getMinutes() > 30) {
        datetime =  datetime + ":30:00Z";
    }
    else{
        datetime = datetime + ":00:00Z";
    }

    var map = new ol.Map({
        target:'map',
        layers: [
            new ol.layer.Group({
                title: 'Base Maps',
                layers: [
                    new ol.layer.Tile({
                        title: 'OpenStreetMap',
                        type: 'base',
                        visible: true,
                        source: new ol.source.OSM()
                    }),
                    new ol.layer.Tile({
                        title: 'Satellite',
                        type: 'base',
                        visible: false,
                        source: new ol.source.MapQuest({layer: 'sat'})
                    }),
                    new ol.layer.Tile({
                        title: 'Bing Map - Road',
                        type: 'base',
                        visible: false,
                        source: new ol.source.BingMaps({
                            imagerySet: 'Road',
                            key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3'
                        })
                    }),
                    new ol.layer.Tile({
                        title: 'Bing Map - Aerial',
                        type: 'base',
                        visible: false,
                        source: new ol.source.BingMaps({
                            imagerySet: 'Aerial',
                            key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3'
                        })
                    })

                ]
            }),
            new ol.layer.Group({
                title: 'Overlays',
                layers: [
                    new ol.layer.Tile({
                        title: 'Sensor',
                        extent: [-13884991, 2870341, -7455066, 6338219],
                        source: new ol.source.TileWMS(({
                            url: 'http://52.0.129.182:8080/geoserver/wms',
                            params: {'LAYERS': 'CHORDS:Sensor', 'transparent': true,'format':'image/png'}
                        }))
                    }),
                    new ol.layer.Image({
                        title: 'Radar',
                        source: new ol.source.ImageStatic({
                            url: 'http://52.0.129.182:8080/geoserver/CHORDS/wms?service=WMS&version=1.1.0&request=GetMap&layers=CHORDS:reflectivity&transparent=true&styles=&bbox=-106,39,-103,42&width=500&height=500&srs=EPSG:4326&format=image/png',
                            imageExtent: ol.proj.transformExtent([-106,39,-103,42],'EPSG:4326','EPSG:3857')
                        })
                    }),
                    new ol.layer.Tile({
                        title: 'NEXRAD',
                        extent: [-13884991, 2870341, -7455066, 6338219],
                        source: new ol.source.TileWMS(({
                            url: 'https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r-t.cgi?',
                            params: {'LAYERS': 'nexrad-n0r-wmst', 'transparent': true,'format':'image/png','time':datetime}

                        }))
                    }),
                    sensorLayer
                ]
            })
        ],
        view: new ol.View({
            projection: 'EPSG:3857',
            center:ol.proj.transform([-95, 40], 'EPSG:4326', 'EPSG:3857'),
            zoom:5
        })
    });

    var layerSwitcher = new ol.control.LayerSwitcher({
        tipLabel: 'Legends' // Optional label for button
    });
    map.addControl(layerSwitcher);

    // -- Display information on singleclick --

    // Create a popup overlay which will be used to display feature info
    var popup = new ol.Overlay.Popup();
    map.addOverlay(popup);

    // Add an event handler for the map "singleclick" event
    map.on('singleclick', function(evt) {

        // Hide existing popup and reset it's offset
        popup.hide();
        popup.setOffset([0, 0]);

        // Attempt to find a feature in one of the visible vector layers
        var feature = map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
            return feature;
        });

        if (feature) {

            var coord = feature.getGeometry().getCoordinates();
            var props = feature.getProperties();
            var info = "<div>" +
                "<b>"+feature.get('name')+"</b>" +
                "<hr/>" +
                feature.get('message') +
                "</div>";
            // Offset the popup so it points at the middle of the marker not the tip
            popup.setOffset([0, -22]);
            popup.show(coord, info);

        }

    });

    // change mouse cursor when over marker
    //map.on('pointermove', function(e) {
    //    console.log("I am heere");
    //    var pixel = map.getEventPixel(e.originalEvent);
    //    var hit = map.hasFeatureAtPixel(pixel);
    //    map.getTarget().style.cursor = hit ? 'pointer' : '';
    //
    //});

})();

