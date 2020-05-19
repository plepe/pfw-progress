<?php include "conf.php"; /* load a local configuration */ ?>
<?php include "modulekit/loader.php"; /* loads all php-includes */ ?>
<?php
db_init();

if (array_key_exists('plz', $_REQUEST)) {
  if (!preg_match('/^1(0[1-9]|1[0-9]|2[0-3])0$/', $_REQUEST['plz'])) {
    print "Invalid PLZ!";
    exit(1);
  }
  $plz = $_REQUEST['plz'];
  $qry = "select datum, {$plz} as plz, sum(plz{$plz}) as count from unterschriften_listen where plz{$plz}>0 group by datum order by datum";
}
else {
  $qry = array();
  for ($i = 1; $i <= 23; $i++) {
    $plz = sprintf("1%1$02d0", $i);
    $qry[] = "select datum, {$plz} as plz, sum(plz{$plz}) as count from unterschriften_listen where plz{$plz}>0 group by datum";
  }
  $qry = 'select * from (' . implode(" union ", $qry) . ') t order by datum, plz';
}

$q = $db->query($qry);
if (!$q) {
  print($db->errorInfo()[2]);
}
$result = $q->fetchAll();

Header('Content-Type: text/csv; charset=utf-8');
Header('Content-Disposition: attachment; filename="platzfuerwien-listen.csv"');

print chr(239) . chr(187) . chr(191); // BOM

print "datum,plz,count\n";
$fd = fopen('php://output', 'w');
foreach ($result as $entry) {
  fputcsv($fd, $entry);
}
