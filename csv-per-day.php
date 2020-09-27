<?php include "conf.php"; /* load a local configuration */ ?>
<?php require "inc/db_init.php" ?>
<?php require "lib/modulekit/PDOext/PDOext.php" ?>
<?php
db_init();

if (array_key_exists('plz', $_REQUEST)) {
  if (!preg_match('/^1(0[1-9]|1[0-9]|2[0-3])0$/', $_REQUEST['plz'])) {
    print "Invalid PLZ!";
    exit(1);
  }
  $plz = $_REQUEST['plz'];
  $qry_offline = "select 'offline' as type, datum, {$plz} as plz, sum(plz{$plz}) as count from unterschriften_listen where plz{$plz}!=0 group by datum order by datum";

  $qry_pdb = "select 'pdb' as type, datum, plz, count(*) count from (select plz, substr(date_recorded, 1, 10) as datum from wp_participants_database where last_accessed is not null and plz=" . $db->quote($plz) . ") t group by datum, plz order by datum, plz";
}
else {
  $qry = array();
  for ($i = 1; $i <= 23; $i++) {
    $plz = sprintf("1%1$02d0", $i);
    $qry[] = "select datum, {$plz} as plz, sum(plz{$plz}) as count from unterschriften_listen where plz{$plz}!=0 group by datum";
  }
  $qry_offline = "select 'offline' as type, datum, plz, count from (" . implode(" union ", $qry) . ') t order by datum, plz';

  $qry_pdb = "select 'pdb' as type, datum, plz, count(*) count from (select plz, substr(date_recorded, 1, 10) as datum from wp_participants_database where last_accessed is not null) t group by datum, plz order by datum, plz";
}

$q = $db->query($qry_offline);
if (!$q) {
  print($db->errorInfo()[2]);
}
$result = $q->fetchAll();

$q = $db->query($qry_pdb);
if (!$q) {
  print($db->errorInfo()[2]);
}
$result = array_merge($result, $q->fetchAll());

$data = array();

foreach ($result as $entry) {
  if (!array_key_exists($entry['datum'], $data)) {
    $data[$entry['datum']] = array();
  }

  $data[$entry['datum']]["{$entry['plz']}-{$entry['type']}"] = $entry['count'];
}

Header('Content-Type: text/csv; charset=utf-8');
Header('Content-Disposition: attachment; filename="platzfuerwien-listen.csv"');

print chr(239) . chr(187) . chr(191); // BOM

$row = array('datum');
for ($plz = 1010; $plz <= 1230; $plz += 10) {
  $row[] = "{$plz} online";
}

for ($plz = 1010; $plz <= 1230; $plz += 10) {
  $row[] = "{$plz} offline";
}

$fd = fopen('php://output', 'w');
fputcsv($fd, $row);

foreach ($data as $date => $entry) {
  $row = array($date);

  for ($plz = 1010; $plz <= 1230; $plz += 10) {
    $row[] = $entry["{$plz}-pdb"] ?? 0;
  }

  for ($plz = 1010; $plz <= 1230; $plz += 10) {
    $row[] = $entry["{$plz}-offline"] ?? 0;
  }

  fputcsv($fd, $row);
}
