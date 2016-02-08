'use strict';
/* global openGlobals:false */
/* global elvisFunctions:false */

/*
  drawer module
  grabs drawer data for player and displays under
 */
var drawer = angular.module('drawer', ['ngSanitize', 'chart']);

drawer.directive('drawer', ['DataService', 'SharedFunctions', '$interval', function(DataService, SharedFunctions, $interval) {
  return {
    restrict: 'A',
    scope: {
      drawerId: '=',
      drawerOpen: '=',
      drawerColspan: '=',
      drawerDevice: '=',
      drawerOrientation: '=',
      drawerScrollWhenUpdated: '=',
      playerFeedRefreshing: '=',
      myLeaderboardFeedLoaded: '=',
      scrollOffset: '@'
    },
    replace: true,
    templateUrl: function(elem, attrs){
      if (attrs.drawer === 'div') {
        return openGlobals.paths.live.drawerTemplateDiv;
      }

      return openGlobals.paths.live.drawerTemplate;
    },
    link: function (scope, element) {

      scope.scorecardPage = 0;
      scope.chartRound = scope.$root.championshipFeed.CurrentRound -1;
      scope.defaultAvatar = openGlobals.paths.live.defaultAvatar;

      var getPlayerStats = function() {
        DataService.getFeed('drawerStats', {playerNo: scope.drawerId})
          .success(function(response){

            // populate scope with response
            scope.player = response;

            scope.playerLoaded = true;
            scope.setRound(scope.player.RoundsPlayed -1);

          });
      };

      /*
        on change of id grab correct data set
       */
      scope.$root.$watch('championshipFeed', function(championshipFeed) {

        if ( typeof championshipFeed === 'undefined' ) { return; }

        //scope.chartRound = championshipFeed.CurrentRound -1;

      });

      /*
        on change of id grab correct data set
       */
      scope.$watch('drawerId', function(id) {

        if ( typeof id === 'undefined' ) { return; }

        getPlayerStats();
        //scope.chartRound = scope.$root.championshipFeed.CurrentRound -1;

        if (!angular.isDefined(scope.parFeed)) {

          DataService.getFeed('coursePars')
            .success(function(response){

              // populate scope with response
              scope.parFeedDrawer = response;
              scope.parFeedDrawerLoaded = true;

            });

        }
        else{
          scope.parFeedDrawer = scope.parFeed;
          scope.parFeedDrawerLoaded = true;
        }

      });

      //var refresh;
      scope.$watch('drawerOpen', function(open) {

        if (!open) { return; }

        var offset = parseInt(scope.scrollOffset,10) || -50;

        function scrollToDrawer(os){
          elvisFunctions.animateScroll(element, {
            'duration': 500,
            'offset': os
          });

        }

        (function feedHandler(){

          DataService.getFeed('drawerStats', {playerNo: scope.drawerId})
            .success(function(response){

              // populate scope with response
              scope.player = response;
              scope.playerLoaded = true;

              // set drawer round to 2nd round if player has played less rounds than what current round is
              // used for cut players
              // if(scope.player.RoundsPlayed < scope.chartRound){
              //   scope.setRound(1);
              // }
              // else if(scope.chartRound === 1){
              //   scope.setRound(0);
              // }
              // else{
              //   scope.setRound(scope.chartRound);
              // }

              // if (!angular.isDefined(refreshDrawer)){
              //   scope.feedRefresh('drawerStats', feedHandler);
              // }

            });
        })();

        // scroll to drawer when open
        if (scope.drawerScrollWhenUpdated === 'true') {
          scrollToDrawer(offset);
        }

        // Feed refresh - pass in type and feed handler to call service
        var refreshDrawer;
        scope.feedRefresh = function(type, handler){

          // return if defined
          if (angular.isDefined(refreshDrawer)){
            return;
          }

          if(scope.playerLoaded === true){

            // if data is loaded call feed handler every x seconds
            // refresh rate set in globals.js
            refreshDrawer = $interval(function() {

              // if draw is hidden cancel refresh
              if(element.is(':hidden')){
                scope.stopRefresh();
              }
              // if visible call handler
              else{
                handler(type);
              }

            }, openGlobals.feedRefresh.drawerFeed);
          }
          else{
            scope.stopRefresh();
          }

        };

        //stop feed refresh - cancel interval
        scope.stopRefresh = function(){
          if (angular.isDefined(refreshDrawer)) {

            $interval.cancel(refreshDrawer);
            refreshDrawer = undefined;
          }
        };

        if (scope.drawerScrollWhenUpdated === 'true') {
          elvisFunctions.animateScroll(element, {
            'duration': 500,
            'offset': -50
          });
        }

        //check if drawer is in view
        var isOnScreen = function(el){
          //special bonus for those using jQuery
          if (typeof jQuery === 'function' && element instanceof jQuery) {
            el = el[0];
          }
          var bounds = el.getBoundingClientRect();
          return bounds.top < window.innerHeight && bounds.bottom > 0;
        };

        // if drawer is in view
        // scroll back to it on data update
        var checkScrollPosition = function(val){
          if( isOnScreen(element) && scope.drawerScrollWhenUpdated === 'true' ){
            scrollToDrawer(val);
          }
          else{
            return;
          }
        };

        // watch for parent data to be loaded
        scope.$watch('playerFeedRefreshing', function(nv, ov) {
          var offset = parseInt(scope.scrollOffset,10) || -50;

          if(nv === false && ov === true){
            checkScrollPosition(offset);
          }
        });
        scope.$watch('myLeaderboardFeedLoaded', function(nv, ov) {
          var offset = parseInt(scope.scrollOffset,10) || -100;

          if(nv === false && ov === true){
            checkScrollPosition(offset);
          }
        });

      });

      scope.setRound = function(round) {
        scope.chartRound = round;
      };

      scope.setScorecardPage = function (page) {
        scope.scorecardPage = page;
      };

      scope.isCurrentScorecard = function (page) {
        return scope.scorecardPage === page;
      };

      scope.isLandscape = function (orientation) {
        return orientation === 'landscape';
      };

      // used on scorcard
      // used to display different colour bgs
      // based on player score minus hole par value
      scope.parDisplay = SharedFunctions.parDisplay;
    }
  };
}]);
