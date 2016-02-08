'use strict';

var courseExplorerControllers = angular.module('courseExplorerControllers', []);

courseExplorerControllers.controller('courseExplorerController', ['$scope', '$window', '$location', '$timeout', '$interval', '$sce', 'DataService', function ($scope, $window, $location, $timeout, $interval, $sce, DataService) {

  // set inital view type
  $scope.viewType = 'overview';
  $scope.holeNo = 1;
  $scope.activePin = openGlobals.paths.courseExplorer.activeDayPin;
  $scope.updatingView = true;
  $scope.markerShow = false;
  $scope.viewShow = false;

  // set device handler
  // set device to desktop, tablet or mobile
  var setScreensize = function() {
    if(elvisFunctions.browserSize.width() < 768){
      $scope.device = 'mobile';
    }
    else if(elvisFunctions.browserSize.width() >= 768 && elvisFunctions.browserSize.width() < 992){
      $scope.device = 'tablet';
    }
    else{
      $scope.device = 'desktop';
    }
  };

  setScreensize();

  angular.element($window).on('debouncedresize', function() {
    $scope.$apply(function() {
      setScreensize();
      if(angular.element('.firefox38')){
        $timeout(function(){
          picturefill({reevaluate: true});
        });
      }
    });
  });

  $scope.$on('$viewContentLoaded', function(){
    $scope.currentPath = $location.path();
    $scope.isOverview = $scope.currentPath === '/';
    runPicturefill();
  });

  // refire picturefill if picture element is not supported
  function runPicturefill() {
    if (!window.HTMLPictureElement) {
      $timeout(function(){
        picturefill({reevaluate: true});
      });
    }
  }

  $scope.$watch('thisHoleData', runPicturefill);

  // handle view changes
  $scope.viewChangeHandler = function(type, hole){

    // set view type, holeNo
    $scope.viewType = type;
    $scope.holeNo = parseInt(hole, 10);

    // updated url
    $location.url($scope.viewType);
    $location.search('hole', $scope.holeNo);

    $timeout(function(){
      // set scope item to index of data object based on holeNo
      $scope.thisHoleData = $scope.holeData.Holes[$scope.holeNo -1];
      $scope.updatingView = false;
    }, 500);

    // call picturefill if not native
    runPicturefill();

    // call view content function
    // pulls in pin positions and poi positions
    $scope.loadViewContent();

  };

  $scope.changeHole = function(ev, hole) {
    ev.preventDefault();
    $scope.viewChangeHandler('holeView', hole);
  };

  $scope.loadViewContent = function(){

    // if green view
    // load pin position data
    if($scope.viewType === 'greenView'){

      // if not loaded before load pinPosition data
      if($scope.pinPositionsDataLoaded !== true){
        // load pin position feed and handle response
        DataService.getFeed('courseExplorerPinPositions')
          .success(function(response){
            // populate scope with response
            $scope.pinPositionsData = response;
            $scope.pinPositionsDataLoaded = true;

            $scope.thisPinPosition = $scope.pinPositionsData['Hole' + $scope.holeNo];

          }).error(function(response){
            if ($window.console) { console.error(response); }
            throw new Error('Error loading courseExplorerPinPositions feed');
          });
      }
      // else set to current hole number
      else{
        $scope.thisPinPosition = $scope.pinPositionsData['Hole' + $scope.holeNo];

        // display markers after delay
        $timeout(function(){
          $scope.markerShow = true;
        }, 700);
      }

    }
    // if hole view and not mobile
    // load poi data
    else if($scope.viewType === 'holeView' && $scope.device !== 'mobile'){

      if($scope.poiPositionsDataLoaded !== true){
        // load poi data feed and handle response
        DataService.getFeed('courseExplorerPOIPositions')
          .success(function(response){
            // populate scope with response
            $scope.poiPositionsData = response;

            $scope.thisPoiPosition = $scope.poiPositionsData['Hole' + $scope.holeNo];

            $timeout(function(){
              $scope.markerShow = true;
              $scope.poiPositionsDataLoaded = true;
            }, 700);

          }).error(function(response){
            if ($window.console) { console.error(response); }
            throw new Error('Error loading courseExplorerPOIPositions feed');
          });
      }
      // else set to current hole number
      else{
        $scope.thisPoiPosition = $scope.poiPositionsData['Hole' + $scope.holeNo];

        // display markers after delay
        $timeout(function(){
          $scope.markerShow = true;
        }, 700);

      }

    }

    // set to display hole and hide loader on mobile
    if($scope.device === 'mobile'){
      $scope.poiPositionsDataLoaded = true;
      // display markers after delay
      $timeout(function(){
        $scope.markerShow = true;
      }, 700);
    }

    // scroll to view on update
    if (angular.element('.ce-view').length) {
      elvisFunctions.animateScroll(angular.element('.ce-view'));
    }

  };

  // set active pin on click
  // sets button class and pin marker
  $scope.setActivePinClick = function(pin){
    $scope.activePin = pin;
  };

  // handle carousel hole count
  // depending on direction increment hole number
  // pass through to the view handler
  $scope.carouselClick = function(view, holeNo, direction){

    $scope.updatingView = true;
    $scope.markerShow = false;

    //set hole number based on click direction
    if(direction === 'next'){
      holeNo = parseInt(holeNo) + 1;
      if(holeNo > 18){
        holeNo = 1;
      }
    }
    else if(direction === 'prev'){
      holeNo = parseInt(holeNo) - 1;
      if(holeNo < 1){
        holeNo = 18;
      }
    }

    // call view handler
    $scope.viewChangeHandler(view, holeNo);

  };

  // map click event
  // pass throught current view and hole number
  // these are set in the view
  $scope.mapClick = function(view, holeNo){

    $scope.updatingView = true;
    $scope.markerShow = false;

    // if hole clicked is already open
    // show overview
    if(parseInt(holeNo) === $scope.holeNo && $scope.viewType !== 'overview'){
      $location.path('/');
      $location.search('');
      $scope.viewType = 'overview';
    }
    else{
      $scope.viewChangeHandler(view, holeNo);
    }

  };

  $scope.viewChangeClick = function(view, holeNo){
    $scope.updatingView = true;
    $scope.viewChangeHandler(view, holeNo);
  };

  $scope.routeHandler = function(){

    $scope.updatingView = true;

    // if is not set to /
    if($location.path() !== '/'){

      // if a hole attrinute isn't set
      // set to hole 1
      if(typeof $location.search().hole === 'undefined'){
        $location.search('hole', 1);
      }

      // use the path to set the view type
      $scope.routePath = $location.path().replace('/', '');

      // pass through the view and the hole
      // fromthe url to the view handler
      $scope.viewChangeHandler($scope.routePath, $location.search().hole);

    }

  };

  $scope.showPlayerMedia = function(contentMain, contentTitle, contentFooter, type){

    // show media player overlay
    $scope.showMedia = true;
    $scope.mediaMain = contentMain;
    $scope.mediaTitle = contentTitle;
    $scope.mediaFooter = contentFooter;
    $scope.mediaType = type;

    if (angular.element('.ce-view').length) {
      elvisFunctions.animateScroll(angular.element('.ce-view'));
    }

  };

  // hide media overlay
  $scope.hideMedia = function(){
    $scope.showMedia = false;
  };

  $scope.construct = function(){

    $scope.mapMarkers = {MapHoles: []};

    // load coursePars feed and handle response
    DataService.getFeed('courseExplorerMapPositions')
      .success(function(response){

        var i = 0,
            mapInterval;

        // populate scope with response
        // add markers in interval
        mapInterval = $interval(function(){
          if (i < response.MapHoles.length) {
            $scope.mapMarkers.MapHoles.push(response.MapHoles[i]);
            i++;
          }
          else{
            $scope.mapMarkersLoaded = true;
            $interval.cancel(mapInterval);
          }
        }, 150);

        // display markers
        $scope.mapMarkerShow = true;

      }).error(function(response){
        if ($window.console) { console.error(response); }
        throw new Error('Error loading courseExplorerMapPositions feed');
      });

    // load coursePars feed and handle response
    DataService.getFeed('courseExplorerHoleData')
      .success(function(response){
        // populate scope with response
        $scope.holeData = response;
        $scope.holeDataLoaded = true;

        // call route handler after data has loaded
        $scope.routeHandler();

        $scope.markerShow = true;

      }).error(function(response){
        if ($window.console) { console.error(response); }
        throw new Error('Error loading courseExplorerHoleData feed');
      });

  };

  // call construct
  // this loads map position data, hole data
  $scope.construct();

  // set map marker positions - left and bottom
  $scope.markerPositionX = function(desktopPos, tabletPos, mobilePos){

    if($scope.device === 'mobile'){
      return mobilePos + '%';
    }
    else if($scope.device === 'tablet'){
      return tabletPos + '%';
    }
    else{
      return desktopPos + '%';
    }

  };

  $scope.markerPositionY = function(desktopPos, tabletPos, mobilePos){

    if($scope.device === 'mobile'){
      return mobilePos + '%';
    }
    else if($scope.device === 'tablet'){
      return tabletPos + '%';
    }
    else{
      return desktopPos + '%';
    }

  };

  $scope.markerDisplay = function(){

    if($scope.markerShow === true){
      return true;
    }
    else if($scope.markerShow === false){
      return false;
    }

  };

  $scope.mapMarkerDisplay = function(){

    if($scope.mapMarkerShow === true){
      return true;
    }
    else if($scope.mapMarkerShow === false){
      return false;
    }

  };

  // set active/disabled button states on day pin position
  $scope.initalDay = $scope.activePin;
  $scope.setDayPinState = function(day){

    if(day === $scope.initalDay && day === $scope.activePin){
      return 'active';
    }
    else if(day !== $scope.initalDay && day === $scope.activePin){
      return 'active';
    }
    else if(day > $scope.initalDay){
      return 'disabled';
    }

  };

}]);
