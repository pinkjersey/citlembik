<?php

require("HashGenerator.php");
require("Hashids.php");
$isbn = htmlspecialchars($_GET["isbn"]);

if (!$isbn)
{
   header("Location: /#/");
   exit;   
}
else
{
$strlen = strlen( $isbn );
for( $i = 0; $i < $strlen; $i++ ) {
    $char = substr( $isbn, $i, 1 );
    // $char contains the current character, so do your processing here
    if (!($char == "-" || is_numeric( $char ))) 
    {
      header("Location: /books");
      exit;
    }

}

$hash = array("975-6663-10-3" => "9xwTRaaFXCl");
if (array_key_exists($isbn, $hash)) {
   header("Location: /books/".$hash[$isbn]);
   exit;
}

$hashids = new Hashids\Hashids('Citlembik salt');
  $integerIDs = array_map('intval', explode('-', $isbn));
  $id = $hashids->encode($integerIDs);
//   print $isbn;
   header("Location: /books/".$id);
   exit;
}

?>