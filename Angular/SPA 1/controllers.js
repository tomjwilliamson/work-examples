'use strict';
/* global elvisFunctions:false */
/* global openGlobals:false */

var leaderboardControllers = angular.module('leaderboardControllers', ['liveSearch', 'drawer']);

leaderboardControllers.controller('leaderboardController',
  ['$scope', '$rootScope', '$location', '$window', '$filter', '$interval', '$timeout', 'DataService', 'SharedFunctions',
  function ($scope, $rootScope, $location, $window, $filter, $interval, $timeout, DataService, SharedFunctions) {

    $rootScope.currentDrawer = {
      id: null,
      context: null
    };
    $scope.showMedia = false;

    // PRIVATE functions
    function orientationHandler(){
      var orientation;

      // get orientation from window or calculate based on viewport size
      if (typeof $window.orientation !== 'undefined') {
        orientation = $window.orientation;
      } else {
        orientation = $window.outerWidth >= $window.outerHeight ? 90: 0;
      }

      if (orientation === 90 || orientation === -90) {
        $scope.orientation = 'landscape';
        $scope.round = angular.isDefined($scope.championshipFeed) ? $scope.championshipFeed.CurrentRound : openGlobals.thisOpen.round;
      } else {
        $scope.orientation = 'portrait';
      }

      // hide device rotate overlay on orientation change
      $scope.showOrientationGraphic = false;

      // hide content if not loaded
      $scope.viewLoaded = false;
      $scope.changeFeedHandler();

    }

    function getRoute(){
      $scope.changeFeedHandler($location.path().replace('/',''));
    }

    // PUBLIC functions

    // show tablet graphic on first load
    $scope.showTabletGraphic = function(){
      $scope.$on('$viewContentLoaded', function(){
        if(!elvisFunctions.cookie('openFirstLoad')) {
          $scope.firstLoad = true;
          $scope.showOrientationGraphic = true;
          elvisFunctions.cookie('openFirstLoad', 'false');
        }
        else {
          $scope.firstLoad = false;
        }
      });
    };

    // update favourites on click
    $scope.updateFavourites = SharedFunctions.updateFavourites;

    $scope.changeFeedHandler = function(type){
      var params;

      if ($scope.device === 'device') {
        type = $scope.orientation === 'landscape' ? 'holeByHole': 'traditional';
        $scope.showTabletGraphic();
      } else if(type === 'null' || type === ''){
        type = 'traditional';
      }

      if (type !== $scope.feedType && $rootScope.currentDrawer.context === 'ld-primary') {
        $rootScope.currentDrawer = {
          id: null,
          context: null
        };
      }

      params = type === 'holeByHole' ? {roundno: $scope.round} : {};

      $scope.feedRefreshing = true;

      DataService.getFeed(type, params)
        .success(function(response){

          $scope.feedType = type;

          // populate scope with response
          $scope.feedData = response;
          $scope.feedDataLoaded = true;
          $scope.feedRefreshing = false;
          $scope.roundLoading = false;

          if($scope.allLoaded !== true){
            $scope.feedDataAmount = $scope.feedData.length;
          }

          // allow window scroll
          $scope.allowScroll = true;

          // call refresh function - pass in feed type and required handler
          if (!angular.isDefined(refresh)){
            $scope.feedRefresh(type, $scope.changeFeedHandler);
          }

          //update location based on type
          $location.path(type);

          if (type === 'holeByHole') {
            $location.search('round', $scope.round);
          } else {
            $location.search('round', null);
          }

          $scope.viewLoaded = true;

        }).error(function(response){
          if ($window.console) { console.error(response); }
          throw new Error('Error loading change handler feed');
        });

    };

    // feed refresh - pass in type and feed handler to call service
    var refresh;
    $scope.feedRefresh = function(type, handler){

      // return if defined
      if (angular.isDefined(refresh)){
        return;
      }

      if($scope.feedDataLoaded === true){

        // if data is loaded call feed handler every x seconds
        // refresh rate set in globals.js
        refresh = $interval(function() {

          // call required handler
          handler(type);

        }, openGlobals.feedRefresh.leaderboardFeed, 0, false);
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

    // View toggle click event - pass in the target
    $scope.viewToggleClickHandler = function(ev, feedTarget){

      $scope.round = $rootScope.championshipFeed.CurrentRound;

      if($scope.device === 'device'){
        $scope.showOrientationGraphic = true;
        return false;
      }
      else if(feedTarget !== $scope.feedType){

        // clear search box on view change
        var scope = angular.element('.control-search').scope();
        scope.searchtext = '';

        // reset sort rules to position - ascending
        $scope.sortColParams('Position', 'pos', 'asc', false);

        // hide content if not loaded
        $scope.viewLoaded = false;
        $scope.feedData = null;
        $scope.feedDataLoaded = false;
        // call feed handler function with target as type
        $scope.changeFeedHandler(feedTarget);
        // cancel feed refresh interval
        $scope.stopRefresh();
        // repeat out inital number of rows
        $scope.allLoaded = false;
      }
      else{
        return false;
      }
    };

    /*
      should cut line be displayed?
     */
    $scope.displayCutLine = function($index) {
      var champFeed = $scope.championshipFeed,
          sortObject = $scope.sortObject,
          round, showCut, showProjectedCut, cutScore, thisPar, prevPar, status, projectCut, cut, hbhR1;

      var parsedToPar = $scope.feedData[$index].ToPar === 'E' ? 0 :  parseInt($scope.feedData[$index].ToPar,10);
      var parsedPrevPar = $index > 0 ? ($scope.feedData[$index-1].ToPar === 'E' ? 0 : parseInt($scope.feedData[$index-1].ToPar,10)) : null;

      if (angular.isDefined(champFeed) && angular.isDefined(sortObject)) {
        round = $scope.feedType === 'holeByHole' ? $scope.round : parseInt(champFeed.CurrentRound,10),
        showCut = sortObject[$scope.sortRules.type][$scope.sortRules.order].separate_cut,
        showProjectedCut = sortObject[$scope.sortRules.type][$scope.sortRules.order].separate_projected_cut,
        cutScore = champFeed.CutScore !== '' ? parseInt(champFeed.CutScore,10) : 0,
        thisPar = parsedToPar,
        prevPar = parsedPrevPar,
        status = parseInt($scope.feedData[$index].Status,10),
        hbhR1 = $scope.feedType === 'holeByHole' && $scope.round === '1' ? false: true,
        projectCut = (thisPar > cutScore && prevPar <= cutScore), // jshint ignore:line
        cut = ($scope.feedData[$index].Status > 1); // jshint ignore:line

        // show cut?
        if (champFeed.ShowCutline && (round <= 2 && showProjectedCut) && hbhR1){
          return projectCut;
        } else if (champFeed.ShowCutline && (round > 2 && showCut) && hbhR1) {
          return cut;
        }
      }

      return false;
    };

    $scope.sortColParams = function(type, col, order, reorder){
      //showAllPlayers();

      var currentType = $scope.sortRules.type,
          currentOrder = $scope.sortRules.order;

      // toggle order if refiring on sorted column
      if (currentType === type && reorder !== false) {
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

    // Update Hole By Hole feed based on round selection
    // Pass in event target and round value, e.g. R1, R2, R3, R4
    $scope.roundSelect = function(ev, roundValue, feedValue){
      var roundInt = roundValue.replace('R', ''),
          currentRound = angular.isDefined($scope.championshipFeed) ? $scope.championshipFeed.CurrentRound : openGlobals.thisOpen.round;

      $scope.round = (roundInt > currentRound) ? currentRound : roundInt;
      $scope.roundLoading = true;

      // cancel feed refresh interval
      $scope.stopRefresh();

      // hide content if not loaded
      $scope.viewLoaded = false;

      // call feed handler - pass in feed value
      $scope.changeFeedHandler(feedValue);

      // repeat out inital number of rows
      $scope.allLoaded = false;

    };

    $scope.showPlayerMedia = function(media, type, name){

      // show media player overlay
      $scope.showMedia = true;
      $scope.mediaType = type;

      $scope.mediaID = media;
      $scope.mediaPlayerName = name;

    };

    $scope.hideMedia = function(){

      // hide media overlay
      $scope.showMedia = false;
    };

    // show all table rows on click
    // update loading text
    var loaderTimer;
    $scope.loadRows = function(ev){

      ev.preventDefault();
      $timeout.cancel(loaderTimer);

      $scope.showLoader = true;

      loaderTimer = $timeout(function(){
        // set data repeat amount to the length of the returned data
        $scope.feedDataAmount = $scope.feedData.length;
        $scope.showLoader = false;
        $scope.allLoaded = true;

      }, 500);

    };

    // set cut line col span value
    // on desktop
    $scope.getColspan = function(isLarge) {

      if($scope.feedType === 'traditional'){
        if (isLarge) {
          return 16;
        } else {
          return 12;
        }
      }
      else{
        if (isLarge) {
          return 26;
        } else {
          return 24;
        }
      }

    };

    // set colspan for playoff
    $scope.getColspanPlayoff = function(isLarge){

      if($scope.playoffFeedLoaded === true){
        if (isLarge) {
          return 25;
        } else {
          return 23;
        }
      }

    };

    // on orientation change for device
    $scope.$watch('orientation', function(){
      // set inital load back to 20
      $scope.allLoaded = false;

      // set cutline colspan
      if ($scope.device === 'device' && $scope.orientation === 'landscape') {
        $scope.numberColumns = 24;
      }
      else if($scope.device === 'device' && $scope.orientation === 'portrait') {
        $scope.numberColumns = 12;
      }

    });

    // update feed on route change
    function routeChangeHandler(){
      var currentType = $scope.feedType,
          newType = $location.path().replace('/', '') || currentType,
          currentRound = $scope.round,
          newRound = $location.search().round || currentRound;

      // update feed based on URL
      if (currentType !== newType) {
        if (newType === 'traditional') {
          $scope.changeFeedHandler(newType);
        }
        if (newType === 'holeByHole') {
          $scope.roundSelect(null, newRound, newType);
        }
      } else if (currentRound !== newRound && currentType === 'holeByHole') {
        $scope.roundSelect(null, newRound, currentType);
      }

      // force re-size on desktop ie
      // fix name field layout collapse
      if(angular.element('html').hasClass('gecko') && !angular.element('html').hasClass('firefox') && $scope.device === 'desktop'){
        angular.element($window).trigger('resize');
      }

    }
    $scope.$on('$routeUpdate', routeChangeHandler);
    $scope.$on('$routeChangeSuccess', routeChangeHandler);


    $scope.construct = function() {

      // drop out if already initialized
      if ($scope.initialized) { return; }

      // hide content if not loaded
      $scope.viewLoaded = false;
      // hide loader
      $scope.showLoader = false;
      // stop window scroll on first load
      $scope.allowScroll = false;

      // load coursePars feed and handle response
      DataService.getFeed('coursePars')
        .success(function(response){
          // populate scope with response
          $rootScope.parFeed = response;
          $scope.parFeedLoaded = true;

        }).error(function(response){
          if ($window.console) { console.error(response); }
          throw new Error('Error loading coursePars feed');
        });

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

      $rootScope.$watch('championshipFeed', function(nv, ov){

        // when loaded set scope.round to value in feed
        if (angular.isDefined(nv) && !angular.isDefined(ov)){
          $scope.round = nv.CurrentRound;
          setDeviceType();
        }
        // before feed has loaded set to globals value
        else if(!angular.isDefined(nv) && !angular.isDefined(ov)){
          $scope.round = $location.search().round || openGlobals.thisOpen.round;
          setDeviceType();
        }

      });

      // detct if on device or desktop
      function setDeviceType(){
        if (!$scope.device) {
          $scope.device = (angular.element('html').hasClass('mobile') && $window.outerWidth <= 1024) ? 'device': 'desktop';
        }

        if ($scope.device === 'device') {
          orientationHandler();
        } else {
          $scope.round = $location.search().round || openGlobals.thisOpen.round;
          getRoute();
        }
      }
      setDeviceType();

      // set desktopsize flag
      $scope.isLargeDesktopWidth = elvisFunctions.browserSize.isLargeDesktopWidth();

      // bind oritentationHandler to orientationChange event
      if ($scope.device === 'device') {
        // Detect whether device supports orientationchange event, otherwise fall back to the resize event.
        var supportsOrientationChange = 'onorientationchange' in window,
            orientationEvent = supportsOrientationChange ? 'orientationchange' : 'resize';

        angular.element(window).on(orientationEvent, orientationHandler);
      } else {

        // desktop only
        // bind resize event to update isMobileWidth and fire digest cycle to update masonry
        angular.element($window).on('debouncedresize', function(){
          var nowDesktop = elvisFunctions.browserSize.isLargeDesktopWidth();

          // if breakpoint changes
          if (nowDesktop !== $scope.isLargeDesktopWidth){
            $scope.$apply(function(){
              $scope.isLargeDesktopWidth = nowDesktop;
            });
          }
        });
      }

      $scope.initialized = true;

    };

    // PUBLIC presentational function

    // display player row based on status
    $scope.checkStatus = SharedFunctions.checkStatus;

    // format movers and shakers string
    $scope.formatMovers = SharedFunctions.formatMovers;

    // used on hole by hole and scorcard
    // used to display different colour bgs
    // based on player score minus hole par value
    $scope.parDisplay = SharedFunctions.parDisplay;

    // used to show red bgs on under par scores
    $scope.underParDisplay = SharedFunctions.underParDisplay;


    //onSelectName()
    //callback function to scroll down to element passed in
    $scope.onSelectName = function(element) {
      var $el = $( '.live-search-container [data-id="' + element.ID + '"]' );

      elvisFunctions.animateScroll( $el, {
        'duration': 500,
        'offset': ($el.height() * (-2)) // display two elements above selected element
      } );
    };


    //filteredElementsChanged()
    //filtered elements have changed
    $scope.filteredElementsChanged = function(elements) {
      $scope.filteredElements = elements;
    };

    //highlightFilteredElement()
    //check whether filtered elements array contains element
    $scope.highlightFilteredElement = function(element) {
      return typeof $scope.filteredElements !== 'undefined' && $scope.filteredElements.indexOf(element) !== -1;
    };

    // toggle drawer
    $scope.toggleDrawer = SharedFunctions.toggleDrawer;

    // check if draw is open
    $scope.drawerOpen = SharedFunctions.drawerOpen;

    // Call construct
    $scope.construct();

    // Playoff section
    // get data and call on interval - if data flag is set to true
    // cancel timeout - if data palyoff flag is false
    var getPlayoffFeed = function(){

      DataService.getFeed('playoff')
        .success(function(response) {

          $scope.playoffFeed = response;
          $scope.playoffFeedLoaded = true;

          // call refresh function
          if (!angular.isDefined(playoffRefresh)){
            playoffRefresh();
          }

        }).error(function(response){
          if ($window.console) { console.error(response); }
          throw new Error('Error loading play off feed');
        });
    };

    var playoffRefresh;
    playoffRefresh = $interval(function() {

      // call required handler
      getPlayoffFeed();

    }, openGlobals.feedRefresh.playoffFeed, 0, false);

     // stop playoff feed refresh - cancel interval
    var stopPlayoffRefresh = function(){

      $interval.cancel(playoffRefresh);
      playoffRefresh = undefined;
    };

    // show/hide playoff section
    $rootScope.$watch('championshipFeed', function(newValue){

      if (angular.isDefined(newValue)){

        if($rootScope.championshipFeed.HasPlayoff !== true){

          //show playoff leadeboard
          $scope.showPlayoff = true;

          //get playoff feed
          getPlayoffFeed();

        }
        else if($rootScope.championshipFeed.HasPlayoff !== true && angular.isDefined(playoffRefresh)){

          // cancel interval
          stopPlayoffRefresh();
        }

        if($rootScope.championshipFeed.PlayoffWinner !== ''){

          // show winner section if present in data
          $scope.showPlayoffWinner = true;
        }

      }

    });

  }
]);
