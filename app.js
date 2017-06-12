(function () {
    var cApp = angular.module('citlembikApp', ['ngSanitize', 'ngRoute', 'ngResource', 'ui.bootstrap', 'citFilters']);

    cApp.run(['$rootScope', '$route', '$location', '$routeParams', '$window', function ($rootScope, $route) {
        $rootScope.$on('$routeChangeSuccess', function () {
            $rootScope.$broadcast("titleUpdated", {
                title: $route.current.title,
                bookId: $route.current.params.bookId
            })
        });
    }]);

    cApp.config(['$routeProvider', '$locationProvider',
		 function ($routeProvider, $locationProvider) {
		     $locationProvider.html5Mode(true);
		     $routeProvider.
			 when('/', {
			     title: "Çitlembik Main Page",
			     templateUrl: 'main-page.html',
			     controller: 'CitCtrl'
			 }).
			 when('/books', {
			     title: "Çitlembik Books",
			     templateUrl: 'books-page.html',
			     controller: 'BooksCtrl'
			 }).
			 when('/books/:bookId', {
			     title: null,
			     templateUrl: 'book-detail.html',
			     controller: 'BookDetailCtrl'
			 }).
			 when('Books', {
			     redirectTo: '/books'
			 }).
			 otherwise({
			     redirectTo: '/'
			 });
		 }]);

    cApp.factory('bookFactory', function ($resource) {
        return $resource("https://citengine.appspot.com/");
    });

    cApp.service("BookSet", ['$rootScope', function ($rootScope) {
        return {
            setBook: function (book) {
                this.book = book;
                $rootScope.$broadcast("bookUpdated", {
                    book: book
                });
            }
        }
    }]);

    cApp.controller("TopCtrl", ['$scope', '$window', '$location', 'bookFactory', 'BookSet', function ($scope, $window, $location, bookFactory, BookSet) {
        $scope.title = "Çitlembik Main Page";
        $scope.book = null;
        $scope.books = bookFactory.query();
        $scope.updateTitleWith = { pageLink: "", isbn: "" };
        $scope.updateTitle = function (pageLink, isbn) {
            $scope.title = "";
            if ($scope.books.length === 0) {
                $scope.updateTitleWith.pageLink = pageLink;
                $scope.updateTitleWith.isbn = isbn;
            } else {
                $scope.book = null;
                for (var i = 0; i < $scope.books.length; ++i) {
                    if ($scope.books[i].pageLink === pageLink || $scope.books[i].isbn === isbn) {
                        $scope.book = $scope.books[i];
                        BookSet.setBook($scope.book);
                        $scope.title = $scope.books[i].name;
                        $scope.title += " - Çitlembik Books - ";
                        $scope.title += $scope.books[i].isbn;
                        break;
                    }
                }
            }
        };

        $scope.books.$promise.then(function () {
            var hashids = new Hashids("Citlembik salt");
            var base = "/books/";
            $scope.books.forEach(function (/* BookType */ book) {
                if (book.pageLink !== null && book.pageLink !== "") {
                    book.link = base.concat(book.pageLink);
                } else {
                    var isbn = book.isbn;
                    var tokens = isbn.split("-").map(function (item) {
                        return parseInt(item, 10);
                    });
                    book.link = base.concat(hashids.encode(tokens));
                }
                if (book.image === "") {
                    book.image = book.isbn + "_kc.jpg";
                }
            });

            if ($scope.updateTitleWith.isbn !== "" || $scope.updateTitleWith.pageLink !== "") {
                $scope.updateTitle($scope.updateTitleWith.pageLink, $scope.updateTitleWith.isbn);
                $scope.updateTitleWith.isbn = "";
                $scope.updateTitleWith.pageLink = "";
            }
        });

        $scope.$on("titleUpdated", function (event, args) {
            var title = "";
            if (args.title === null) {
                var pageLink = args.bookId;
                var isbn = "";
                var hashids = new Hashids("Citlembik salt");
                var numbers = hashids.decode(args.bookId);
                var arrayLength = numbers.length;
                
                for (var i = 0; i < arrayLength; ++i) {
                    isbn += numbers[i].toString();
                    if ((i + 1) < arrayLength) {
                        isbn += "-";
                    }
                }
                
                $scope.updateTitle(pageLink, isbn);
                title = $scope.title;
            } else {
                title = args.title;
                $scope.title = args.title;
            }
            var path = $location.path();
            $window.ga('set', {
                page: path,
                title: title
            });
            $window.ga('send', 'pageview');

        })
    }]);

    cApp.controller('CitCtrl', ['$scope', function ($scope) {
        $scope.webtext = webtext['jumbo'];
        $scope.left = webtext['left'];
        $scope.right = webtext['right'];
    }]);

    cApp.controller('BookDetailCtrl', ['$scope', '$routeParams', 'bookFactory', function ($scope) {
        $scope.isError = ($scope.book === null);
        if ($scope.isError) {
            $scope.webtext = webtext['bookMissing'];
        }

        $scope.$on("bookUpdated", function () {
            $scope.isError = ($scope.book === null);
            if ($scope.isError) {
                $scope.webtext = webtext['bookMissing'];
            }
        });

    }]);

    cApp.controller('BooksCtrl', ['$scope', '$http', 'bookFactory', function ($scope) {
        $scope.remainingBooks = [];
        $scope.filteredBooks = [];
        $scope.featuredBooks = [];
        $scope.currentPage = 1;
        $scope.numPerPage = 6;
        $scope.maxPages = 5;
        $scope.hasFeaturedBooks = false;

        $scope.numPages = function () {
            return Math.ceil($scope.books.length / $scope.numPerPage);
        };

        $scope.books.$promise.then(function () {
            var removeIndex = [];
            for (var i = 0; i < $scope.books.length; ++i) {
                var /*BookType*/ book = $scope.books[i];
                if (book.featured) {
                    $scope.featuredBooks.push(i);
                    removeIndex.push(i);
                    if ($scope.featuredBooks.length === 2) {
                        break;
                    }
                }
            }
            $scope.remainingBooks = $scope.books.slice(0);
            for (var j = removeIndex.length - 1; j >= 0; --j) {
                $scope.remainingBooks.splice(removeIndex[j], 1);
            }

            $scope.totalItems = $scope.remainingBooks.length;
            if ($scope.featuredBooks.length > 0) {
                $scope.hasFeaturedBooks = true;
            }

            $scope.$watch('currentPage + itemsPerPage', function () {
                var begin = (($scope.currentPage - 1) * $scope.numPerPage);
                var end = begin + $scope.numPerPage;
                $scope.filteredBooks = $scope.remainingBooks.slice(begin, end);
            });
        });
    }]).directive('citBook', function () {
        return {
            restrict: 'E',
            scope: {
                book: '=info'
            },
            templateUrl: 'book-product.html'
        }
    });


})();