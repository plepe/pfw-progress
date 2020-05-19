<?php
function db_init () {
  global $db_conf;
  global $db;

  if (!isset($db_conf)) {
    print "\$db_conf has not been defined.";
    exit(1);
  }

  try {
    $db_conf[PDO::MYSQL_ATTR_INIT_COMMAND] = "SET NAMES utf8";
    $db = new PDOext($db_conf);
    $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
  }
  catch (Exception $e) {
    print "Can't connect to database: " . $e->getMessage();
    exit(1);
  }
}
