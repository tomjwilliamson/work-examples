'use strict';
/* global openGlobals:false */
/* global elvisFunctions:false */

/**
 * @ngdoc My Leaderboard module for The Open
 * @name MyLeaderboard module
 * @description
 * # My Leaderboard module for The Open
 *
 * Main module of the application.
 */

var myLeaderboard = angular.module('MyLeaderboard', ['liveServices', 'drawer', 'leaderboardFilters']);

myLeaderboard.controller('myLeaderboardController', [
  '$rootScope', '$scope', '$window', '$filter', '$interval', 'DataService', 'SharedFunctions',
  function ($rootScope, $scope, $window, $filter, $interval, DataService, SharedFunctions) {

    // on load set leaderboard to be hidden
    $scope.showMyleaderboard = false;

    // only show loading icon on first load || when loading additional data
    $scope.myLeaderboardFeedLoaded = false;

    // open/close my leaderboard click event
    $scope.openMyLeaderboard = function(state){

      // open leaderboard if click value is open
      // read cookie data
      if(state === 'open'){
        $scope.showMyleaderboard = true;
        getFavouriteCookies();

        if (angular.isUndefined($rootScope.currentDrawer)) {
          $rootScope.currentDrawer = {
            id: null,
            context: null
          };
        }
      }
      else{
        $scope.showMyleaderboard = false;
        $scope.stopRefresh();
      }

    };

    // check favourite cookie
    function getFavouriteCookies(){

      // if not undefined
      // set scope item with favourites and count items
      if(typeof elvisFunctions.cookie('openFavourites') !== 'undefined'){

        $scope.favourites = elvisFunctions.cookie('openFavourites').split(',');
        $scope.favouriteCount = $scope.favourites.length;

        // if open get data
        if($scope.showMyleaderboard === true){
          feedHandler();
        }

      }
      else{
        // hide if empty
        $scope.favourites = [];
        $scope.showMyleaderboard = false;
      }

    }

    function feedHandler(){

      DataService.getFeed('myLeaderboard')
      .success(function(response){

          var data = [];
          angular.forEach(response, function(item){

            for(var i = 0; i < $scope.favourites.length; i++){
              if(item.ID === $scope.favourites[i].toString()){
                data.push(item);
              }
            }

          });

          $scope.myLeaderboardFeed = data;
          $scope.myLeaderboardFeedLoaded = true;

          // call refresh function - pass in required handler
          if (!angular.isDefined(refresh)){
            $scope.feedRefresh(feedHandler);
          }

        }).error(function(response){
          if ($window.console) { console.error(response); }
          throw new Error('Error loading myLeaderboard feed');
        });

    }

    // feed refresh - pass in type and feed handler to call service
    var refresh;
    $scope.feedRefresh = function(handler){

      // return if defined
      if (angular.isDefined(refresh)){
        return;
      }

      if($scope.myLeaderboardFeedLoaded === true){

        // if data is loaded call feed handler every x seconds
        // refresh rate set in globals.js
        refresh = $interval(function() {

          // call required handler
          handler();

        }, openGlobals.feedRefresh.myLeaderboardFeed, 0, false);
      }
      else{
        $scope.stopRefresh();
      }

    };

    // stop feed refresh - cancel interval
    $scope.stopRefresh = function(){
      if (angular.isDefined(refresh)) {

        $interval.cancel(refresh);
        refresh = undefined;
      }
    };

    // show/hide columns based on width
    // set colspan value for drawer
    $scope.isLargeDesktopWidth = elvisFunctions.browserSize.isLargeDesktopWidth();

    if ($scope.isLargeDesktopWidth) {
      $scope.numberColumns = 16;
    }
    else {
      $scope.numberColumns = 12;
    }

    // show/hide columns based on resize
    // set colspan value for drawer on resize
    angular.element($window).on('debouncedresize', function(){

      $scope.isLargeDesktopWidth = elvisFunctions.browserSize.isLargeDesktopWidth();

      if ($scope.isLargeDesktopWidth === true) {
        $scope.numberColumns = 16;
      }
      else {
        $scope.numberColumns = 12;
      }

    });

    // format movers string
    $scope.formatMovers = SharedFunctions.formatMovers;

    // used to show red bgs on under par scores
    $scope.underParDisplay = SharedFunctions.underParDisplay;

    // toggle drawer
    $scope.toggleDrawer = SharedFunctions.toggleDrawer;

    // check if draw is open
    $scope.drawerOpen = SharedFunctions.drawerOpen;

    // update favourites
    $scope.updateFavourites = SharedFunctions.updateFavourites;


    // on update of favourite cookie
    // read cookie and update feed
    // stop refresh
    // scroll to my leaderboard section if first selection

    var firstFavourite = true;
    $scope.$on('favsUpdated', function() {

      // on update stop refresh and get cookie value
      $scope.stopRefresh();
      getFavouriteCookies();

      if($rootScope.favourites.length === 1 && firstFavourite === true){
        elvisFunctions.animateScroll( angular.element('.live-fav-leaderboard'), {
          'duration': 500
        });
        $scope.showMyleaderboard = true;
        feedHandler();
        firstFavourite = false;
      }

    });

    // functions to call on load
    $scope.construct = function() {

      getFavouriteCookies();
    };

    $scope.construct();

    // sorting functionality
    DataService.getFeed('sortRules')
      .success(function(response) {

        $scope.sortObject = response;
        $scope.sortFeedLoaded = true;

      }).error(function(response){
        if ($window.console) { console.error(response); }
        throw new Error('Error loading sortRules feed');
      });

    //  set default sorting
    $scope.sortRules = {
      type: 'Position',
      order: 'asc',
      col: 'pos'
    };

    $scope.sortColParams = function(type, col, order){
      var currentType = $scope.sortRules.type,
          currentOrder = $scope.sortRules.order;

      // toggle order if refiring on sorted column
      if (currentType === type) {
        order = (currentOrder === 'asc') ? 'desc': 'asc';
      }

      if (angular.isDefined(type)) {
        $scope.sortRules.type = type;
      }
      if (angular.isDefined(col)) {
        $scope.sortRules.col = col;
      }
      if (angular.isDefined(order)) {
        $scope.sortRules.order = order;
      }

      $scope.sortRulesForColumn = $scope.sortObject[type][$scope.sortRules.order];
    };

    // set scope item to mobile if width is < 768
    if(elvisFunctions.browserSize.isMobileWidth()){
      $scope.device = 'mobile';
      var orientation;

      var orientationHandler = function(){
        // get orientation from window or calculate based on viewport size
        if (typeof $window.orientation !== 'undefined') {
          orientation = $window.orientation;
        } else {
          orientation = $window.outerWidth >= $window.outerHeight ? 90: 0;
        }

        if (orientation === 90 || orientation === -90) {
          $scope.orientation = 'landscape';
        } else {
          $scope.orientation = 'portrait';
        }

      };

      orientationHandler();

       // Detect whether device supports orientationchange event, otherwise fall back to the resize event.
      var supportsOrientationChange = 'onorientationchange' in window,
          orientationEvent = supportsOrientationChange ? 'orientationchange' : 'resize';

      angular.element(window).on(orientationEvent, orientationHandler);

    }
    else{
      $scope.device = '';
    }


    $scope.showCols = function(){

      if ($scope.orientation === 'landscape' && $scope.device === 'mobile'){
        return true;
      }
      else if ($scope.orientation === 'portrait' && $scope.device === 'mobile'){
        return false;
      }
      else{
        return true;
      }

    };

    // set cut line col span value
    // on desktop
    $scope.getColspan = function(orientation) {

      if($scope.device === 'mobile'){

        if (orientation === 'landscape') {
          return 11;
        } else {
          return 6;
        }
      }
      else{
        if (elvisFunctions.browserSize.isLargeDesktopWidth()) {
          return 16;
        } else {
          return 12;
        }
      }
    };


    // hide columns on mobile
    $scope.hideColsOnMobile = function(display){

      if($scope.device === 'mobile'){

        if ($scope.orientation === 'landscape') {
          return display;
        }

        return !display;

      }
    };

  }
]).directive('myLeaderboardTemplate', [
  function(){
    return {
      restrict: 'EA',
      replace: true,
      scope: true,
      controller: 'myLeaderboardController',
      templateUrl: openGlobals.paths.live.myLeaderboardTemplate
    };
  }
]).
directive('mldShowonhover',function() {
  return {
    link : function(scope, element) {

        element.on('mouseenter', function() {
          var popoverHtml =  '<div class="popover right popover-white">' +
                                '<div class="arrow"></div>' +
                                '<div class="popover-content popover-content-small">' +
                                '<p class="text-align-center">Remove player from</p>' +
                                '<h4 class="text-align-center">My Leaderboard</h4>' +
                                '</div></div>';

          element.append(popoverHtml);
          element.children('.popover').show();
          element.addClass('hover');
        });
        element.on('mouseleave click', function() {
          element.children('.popover').remove();
          element.removeClass('hover');
        });
      }
  };
});
