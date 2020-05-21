<?php
function pfwGetCurrent () {
  global $db;

  $qry = array();
  for ($i = 1; $i <= 23; $i++) {
    $plz = sprintf("1%1$02d0", $i);
    $qry[] = "select sum(plz{$plz}) as count from unterschriften_listen where plz{$plz}>0";
  }
  $qry_offline = "select sum(count) as count from (" . implode(" union ", $qry) . ') t';

  $q = $db->query($qry_offline);
  if (!$q) {
    print($db->errorInfo()[2]);
  }
  $count_offline = $q->fetchAll()[0]['count'];

  $qry_pdb = "select count(*) as count from wp_participants_database where last_accessed is not null";
  $q = $db->query($qry_pdb);
  if (!$q) {
    print($db->errorInfo()[2]);
  }
  $count_pdb = $q->fetchAll()[0]['count'];

  return (int)$count_pdb + (int)$count_offline;
}
