angular.module('citFilters', []).filter('breakFilter', function() {
  return function(input) {
      var ret = "";
      for (i = 0; i < input.length; i++) { 
	  ret += input[i] + "<br>";
      }
      return ret;
  };
});