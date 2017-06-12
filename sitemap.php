<?php
require("HashGenerator.php");
require("Hashids.php");

function dobooklist()
{
$hashids = new Hashids\Hashids('Citlembik salt');
  
$string = file_get_contents("https://citengine.appspot.com");
$json_a = json_decode($string, true);
foreach ($json_a as $book) {
   $isbn = $book["isbn"];
   $priority = $book["priority"];
   $lastMod = date('Y-m-d', $book["lastModified"]);
   $freq = "monthly";
   if ($priority < 0.5) {
      $freq = "yearly"; 
   }
   if ($priority > 0.9) {
      $freq = "weekly";
   }
   $integerIDs = array_map('intval', explode('-', $isbn));
  $id = $hashids->encode($integerIDs);
  $link = "http://www.citlembik.com.tr/books/".$id;
  myurl($link, $lastMod, $freq, $priority);
}
}

header('Content-type: application/xml');
print "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
print "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd\">\n";


function myurlShort($loc)
{
  print("<url>");
  print("<loc>".$loc."</loc>");
//  print("<lastmod>".$lastmod."</lastmod>");
//  print("<changefreq>".$cf."</changefreq>");
//  print("<priority>".$pr."</priority>");
  print("</url>\n");
}

function myurl($loc, $lastmod, $cf, $pr)
{
  print("<url>");
  print("<loc>".$loc."</loc>");
  if ($lastmod != null) {
    print("<lastmod>".$lastmod."</lastmod>");
  }
  print("<changefreq>".$cf."</changefreq>");
  print("<priority>".$pr."</priority>");
  print("</url>\n");
}


//myurl("http://www.citlembik.com.tr/", date("Y-m-d"),"monthly", "0.5");
//myurl("http://www.citlembik.com.tr/books", date("Y-m-d"),"monthly", "0.5");
myurlShort("http://www.citlembik.com.tr/");
myurlShort("http://www.citlembik.com.tr/books");
dobooklist();

print "</urlset>";
return;


?>
