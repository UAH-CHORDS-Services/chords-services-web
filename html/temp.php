<?php
 $sensor_url="http://52.0.129.182:8080/geoserver/CHORDS/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=CHORDS:Sensor&maxFeatures=50&outputFormat=json";
    $sensor_data =file_get_contents($sensor_url) or die('Unable to get content!');

    $sensor_json = json_decode($sensor_data);
	echo $sensor_json;
?>
