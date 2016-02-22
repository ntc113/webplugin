angular.module('soweb', [
]).controller("HomeController", function ($scope) {
	$scope.name = "congnt29";
}).directive("myHeader", function () {
    
    return {
        template: '<p>This is local header</p>'
        // templateUrl: 'app/templates/head.html'
    };
}).directive("myFooter", function () {
    return {
        template: '<p>This is local footer</p>'
    };
});