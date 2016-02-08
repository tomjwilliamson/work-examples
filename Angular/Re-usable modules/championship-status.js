'use strict';
/* global openGlobals:false */

/**
 * @ngdoc Championship status module for The Open
 * @name ChampionshipStatusApp
 * @description
 * # Championship status module for The Open
 *
 * Main module of the application.
 */

var championshipStatus = angular.module('ChampionshipStatus', ['liveServices']);

championshipStatus.controller('championshipStatusController', [
  '$rootScope', '$scope', '$window', '$interval', 'DataService',
  function ($rootScope, $scope, $window, $interval, DataService) {

    // show/hide championship live coverage link
    $scope.showLink = openGlobals.paths.live.showChampionshipLink;

    // Feed handler - call service passing in feed type required.
    // Call refresh feed function to set interval value
    (function feedHandler(){

      DataService.getFeed('championshipStatus')
      .success(function(response){

          // // populate scope with response
          $rootScope.championshipFeed = response;
          $scope.championshipFeedLoaded = true;

          // call refresh function - pass in feed type and required handler
          if (!angular.isDefined(refreshStatus)){
            $scope.feedRefresh('championshipStatus', feedHandler);
          }

        }).error(function(response){
          if ($window.console) { console.error(response); }
          throw new Error('Error loading championshipStatus feed');
        });

    })();

    // Feed refresh - pass in type and feed handler to call service
    var refreshStatus;
    $scope.feedRefresh = function(type, handler){

      // return if defined
      if (angular.isDefined(refreshStatus)){
        return;
      }

      if($scope.championshipFeedLoaded === true){

        // if data is loaded call feed handler every x seconds
        // refresh rate set in globals.js
        refreshStatus = $interval(function() {

          // call required handler
          handler(type);

          // console.log(type);
        }, openGlobals.feedRefresh.championshipFeed);
      }
      else{
        $scope.stopRefresh();
      }

    };

    //stop feed refresh - cancel interval
    $scope.stopRefresh = function(){
      if (angular.isDefined(refreshStatus)) {

        $interval.cancel(refreshStatus);
        refreshStatus = undefined;
      }
    };

  }
]).directive('championshipState', [
  function(){
    return {
      restrict: 'EA',
      scope: true,
      replace: true,
      controller: 'championshipStatusController',
      templateUrl: openGlobals.paths.live.championshipStatusTemplate
    };
  }
]);
