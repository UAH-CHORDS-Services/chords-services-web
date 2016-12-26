<html>
<head>
    <title>CHORDS</title>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
    <script src="https://openlayers.org/en/v3.3.0/build/ol.js"></script>
    <script src="ol3-layerswitcher.js"></script>
    <script src="ol3-popup.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/js/bootstrap.min.js"></script>

    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css">
    <link rel="stylesheet" href="ol3-layerswitcher.css" />
    <link rel="stylesheet" href="ol3-popup.css" />
    <link rel="stylesheet" href="CHORDS_Styling.css">
</head>
<body>
    <?php
#    $sensor_url="http://52.0.129.182:8080/geoserver/CHORDS/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=CHORDS:Sensor&maxFeatures=50&outputFormat=json";
$sensor_url="data.json";
    $sensor_data =file_get_contents($sensor_url) or die('Unable to get content!');
    $sensor_json = json_decode($sensor_data);

    $data = array();
    foreach($sensor_json->{'features'} as $feature){
        $temp = explode(".",$feature->{'id'});
        $variableId = $temp[1];
        $variableLon = $feature->{'geometry'}->{'coordinates'}[1];
        $variableLat = $feature->{'geometry'}->{'coordinates'}[0];
        $variableValue = $feature->{'properties'}->{'current_value'};
        $variableTakenAt = $feature->{'properties'}->{'taken_at'};
        $variableMaxValue = $feature->{'properties'}->{'max_value'};
        $variableMinValue = $feature->{'properties'}->{'min_value'};

        $variableNode = $feature->{'properties'}->{'title'};
	#echo $variableLon;
        if(empty($data[$variableNode])){
            $data[$variableNode]['location'] = array('lat' => $variableLat, 'lon' => $variableLon);
        }
        $data[$variableNode]['variables'][] = array('id' => $variableId, 'value' => $variableValue, 'takenAt' => $variableTakenAt, 'max' => $variableMaxValue, 'min' => $variableMinValue);
    }

    //Create necessary JS for features
    echo '<script type="application/javascript">';
    echo 'var sensorList=[];';

    foreach($data as $node=>$content){

        $htmlContent ='<div id="sensor_data">';
        foreach($content["variables"] as $variable){
            $htmlContent .= '<b>'.ucfirst($variable['id']).'</b>';
            $htmlContent .= '<ul>';
            $htmlContent .= '<li class="sensor_li"><b> Current Value:</b> '. $variable['value'].'</li><br/>';
            $htmlContent .= '<li class="sensor_li"><b> Taken At:</b> '. $variable['takenAt'].'</li><br/>';
            //$htmlContent .= '<li class="sensor_li"><b> Max:</b> '. $variable['max'].'</li><br/>';
            //$htmlContent .= '<li class="sensor_li"><b> Min:</b> '. $variable['min'].'</li><br/>';
            $htmlContent .= '</ul>';

        }
        $htmlContent .='</div>';
#echo $content["location"]["lon"]
        echo 'sensorList.push(
                    new ol.Feature({
                    geometry: new ol.geom.Point(ol.proj.transform(['.$content["location"]["lon"].','.$content["location"]["lat"].'], \'EPSG:4326\', \'EPSG:3857\')),
                    name:\''.$node.'\',
                    message: \''.$htmlContent.'\'
                    })
              );';
    }

    echo '</script>';
    ?>
    <div id="header">
       <img id="logo" src="CHORDS.png">
    </div>
    <br/>
    <div id="map_wrapper">
        <div id="map"><div id="popup"></div></div>
    </div>


    <script defer="defer" type="application/javascript" src="main.js"></script>
</body>
</html>
