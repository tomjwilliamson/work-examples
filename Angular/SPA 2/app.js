'use strict';

/**
 * @ngdoc overview
 * @name CourseExplorerApp
 * @description
 * # Course Explorer front end application.
 *
 * Main module of the application.
 */

var courseExplorerApp = angular.module('courseExplorerApp', ['courseExplorerControllers', 'liveServices', 'ngRoute', 'ngAnimate', 'ngSanitize']);

courseExplorerApp.config(['$routeProvider', '$locationProvider', '$interpolateProvider', function($routeProvider, $locationProvider, $interpolateProvider) {

  $locationProvider.html5Mode(false).hashPrefix('!');
  $interpolateProvider.startSymbol('{-');
  $interpolateProvider.endSymbol('-}');

  $routeProvider
    .when('/holeView', {
      templateUrl: openGlobals.paths.courseExplorer.holeTemplate,
      reloadOnSearch: false
    })
    .when('/greenView', {
      templateUrl:  openGlobals.paths.courseExplorer.holeTemplate,
      reloadOnSearch: false
    })
    .when('/', {
      templateUrl:  openGlobals.paths.courseExplorer.overviewTemplate,
      reloadOnSearch: false
    })
    .otherwise({
      redirectTo:'/'
    });

}]).
directive('mediaoverlay', [ '$timeout', function($timeout) {
  return {
    link : function(scope) {

      scope.$watch('showMedia', function(nv){

        // if showMedia is true - create player passing in ID from data
        // if false - destroy player
        if(nv === true){
          contentOnDemand.makePlayer(scope.mediaMain, 'kp-single-1', 'streamuk-single');
        }
        else if(nv === false){
          $timeout(function(){
            kWidget.destroy('kp-single-1');
          }, 250);
        }

      });

    }
  };
}])
.directive('accordionToggle', [ function() {
  //accordion function
  return {
    restrict: 'A',
    link: function(scope, element) {
      scope.$watch('thisPage', function(){
        elvisFunctions.accordionToggle(element);
      });
    }
  };
}]);
