<?php
$csvfile = fopen('/tmp/data.csv', 'r');
$fields = fgetcsv($csvfile);

$count_recorded = array();

while ($row = fgetcsv($csvfile)) {
  $entry = array();
  $tr = array();
  foreach ($fields as $i => $k) {
    $entry[$k] = $row[$i];
    $tr["[{$k}]"] = $row[$i];
  }

  if ($entry['last_accessed']) {
    $day = substr($entry['date_recorded'], 0, 10);

    if (!array_key_exists($day, $count_recorded)) {
      $count_recorded[$day] = array();
    }
    if (!array_key_exists($entry['plz'], $count_recorded[$day])) {
      $count_recorded[$day][$entry['plz']] = 0;
    }
    $count_recorded[$day][$entry['plz']]++;
  }
}

// remove data from today, as this is not finished
unset($count_recorded[Date('Y-m-d')]);

$result = "date:plz:count\n";
ksort($count_recorded);
foreach ($count_recorded as $day => $c1) {
  ksort($c1);
  foreach ($c1 as $plz => $c) {
    $result .= "{$day}:{$plz}:{$c}\n";
  }
}

file_put_contents("plz.csv", $result);
