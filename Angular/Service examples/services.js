'use strict';
/* global openGlobals:false */
/* global elvisFunctions:false */

var LiveServices = angular.module('liveServices', []);

LiveServices.factory('DataService', [ '$http', function ($http) {

  var DataService = {};

  DataService.getFeed = function(feedType, params) {
    var path;
    var comscoreAnalytics = [];
    switch(feedType){
    case 'traditional':
      path = openGlobals.paths.live.leaderboard.traditional;

      comscoreAnalytics.push({key: 'scoring_section', value: feedType });
      comscoreAnalytics.push({key: 'ns_ilevel', value: 10 });
      window.customActionProxy.getInstance().NotifyActionMade('leaderboard', comscoreAnalytics);
      break;

    case 'holeByHole':
      path = openGlobals.paths.live.leaderboard.holeByHole;

      comscoreAnalytics.push({key: 'scoring_section', value: feedType });
      comscoreAnalytics.push({key: 'ns_ilevel', value: 10 });
      window.customActionProxy.getInstance().NotifyActionMade('leaderboard', comscoreAnalytics);
      break;

    case 'championshipStatus':
      path = openGlobals.paths.live.championshipStatus;

      comscoreAnalytics.push({key: 'scoring_section', value: feedType });
      comscoreAnalytics.push({key: 'ns_ilevel', value: 10 });
      window.customActionProxy.getInstance().NotifyActionMade('leaderboard', comscoreAnalytics);
      break;

    case 'myLeaderboard':
      path = openGlobals.paths.live.myLeaderboard;

      comscoreAnalytics.push({key: 'scoring_section', value: feedType });
      comscoreAnalytics.push({key: 'ns_ilevel', value: 10 });
      window.customActionProxy.getInstance().NotifyActionMade('leaderboard', comscoreAnalytics);
      break;

    case 'playoff':
      path = openGlobals.paths.live.leaderboard.playoff;

      comscoreAnalytics.push({key: 'scoring_section', value: feedType });
      comscoreAnalytics.push({key: 'ns_ilevel', value: 10 });
      window.customActionProxy.getInstance().NotifyActionMade('leaderboard', comscoreAnalytics);
      break;

    case 'coursePars':
      path = openGlobals.paths.live.coursePars;

      comscoreAnalytics.push({key: 'scoring_section', value: feedType });
      comscoreAnalytics.push({key: 'ns_ilevel', value: 10 });
      window.customActionProxy.getInstance().NotifyActionMade('leaderboard', comscoreAnalytics);
      break;

    case 'holeStats':
      path = openGlobals.paths.live.holeStats;

      comscoreAnalytics.push({key: 'scoring_section', value: feedType });
      comscoreAnalytics.push({key: 'ns_ilevel', value: 10 });
      window.customActionProxy.getInstance().NotifyActionMade('holestatistics', comscoreAnalytics);
      break;

    case 'sortRules':
      path = openGlobals.paths.live.sortRules;
      break;

    case 'drawerStats':
      path = openGlobals.paths.live.leaderboard.drawerStats;

      comscoreAnalytics.push({key: 'scoring_section', value: feedType });
      comscoreAnalytics.push({key: 'ns_ilevel', value: 10 });
      window.customActionProxy.getInstance().NotifyActionMade('leaderboard', comscoreAnalytics);
      break;

    case 'playerStatsGroups':
      path = openGlobals.paths.live.playerStats.playerStatsGroups;

      comscoreAnalytics.push({key: 'scoring_section', value: feedType });
      comscoreAnalytics.push({key: 'ns_ilevel', value: 10 });
      window.customActionProxy.getInstance().NotifyActionMade('playerStats', comscoreAnalytics);
      break;

    case 'playerStatsAll':
      path = openGlobals.paths.live.playerStats.playerStatsAll;

      comscoreAnalytics.push({key: 'scoring_section', value: feedType });
      comscoreAnalytics.push({key: 'ns_ilevel', value: 10 });
      window.customActionProxy.getInstance().NotifyActionMade('playerStats', comscoreAnalytics);
      break;

    case 'playerStatsFav':
      path = openGlobals.paths.live.playerStats.playerStatsFav;

      comscoreAnalytics.push({key: 'scoring_section', value: feedType });
      comscoreAnalytics.push({key: 'ns_ilevel', value: 10 });
      window.customActionProxy.getInstance().NotifyActionMade('playerStats', comscoreAnalytics);
      break;

    case 'teeTimes':
      path = openGlobals.paths.live.teeTimes;

      comscoreAnalytics.push({key: 'scoring_section', value: feedType });
      comscoreAnalytics.push({key: 'ns_ilevel', value: 10 });
      window.customActionProxy.getInstance().NotifyActionMade('teeTimes', comscoreAnalytics);
      break;

    case 'myTeeTimes':
      path = openGlobals.paths.live.myTeeTimes;

      comscoreAnalytics.push({key: 'scoring_section', value: feedType });
      comscoreAnalytics.push({key: 'ns_ilevel', value: 10 });
      window.customActionProxy.getInstance().NotifyActionMade('teeTimes', comscoreAnalytics);
      break;

    case 'groupLocations':
      path = openGlobals.paths.live.playerLocator.groupLocations;

      comscoreAnalytics.push({key: 'scoring_section', value: feedType });
      comscoreAnalytics.push({key: 'ns_ilevel', value: 10 });
      window.customActionProxy.getInstance().NotifyActionMade('playerLocator', comscoreAnalytics);
      break;

    case 'mapConversion':
      path = openGlobals.paths.live.playerLocator.mapConversion;
      break;

    case 'courseExplorerMapPositions':
      path = openGlobals.paths.courseExplorer.mapPositions;

      comscoreAnalytics.push({key: 'scoring_section', value: feedType });
      comscoreAnalytics.push({key: 'ns_ilevel', value: 10 });
      window.customActionProxy.getInstance().NotifyActionMade('thecourse', comscoreAnalytics);
      break;

    case 'courseExplorerHoleData':
      path = openGlobals.paths.courseExplorer.holeData;

      comscoreAnalytics.push({key: 'scoring_section', value: feedType });
      comscoreAnalytics.push({key: 'ns_ilevel', value: 10 });
      window.customActionProxy.getInstance().NotifyActionMade('thecourse', comscoreAnalytics);
      break;

    case 'courseExplorerPinPositions':
      path = openGlobals.paths.courseExplorer.pinPositions;

      comscoreAnalytics.push({key: 'scoring_section', value: feedType });
      comscoreAnalytics.push({key: 'ns_ilevel', value: 10 });
      window.customActionProxy.getInstance().NotifyActionMade('thecourse', comscoreAnalytics);
      break;

    case 'courseExplorerPOIPositions':
      path = openGlobals.paths.courseExplorer.poiPositions;

      comscoreAnalytics.push({key: 'scoring_section', value: feedType });
      comscoreAnalytics.push({key: 'ns_ilevel', value: 10 });
      window.customActionProxy.getInstance().NotifyActionMade('thecourse', comscoreAnalytics);
      break;

    }

    return $http.get(path, {params: params});

  };

  return DataService;

}]);

LiveServices.factory('SharedFunctions', [ '$rootScope', function ($rootScope) {
  var SharedFunctions = {};

  //format movers and shakers string
  SharedFunctions.formatMovers = function(value){

    var moversDirection;

    if (value.Status === 1) {
      var intValue = parseInt(value.Movers, 10);

      if(isNaN(intValue) || intValue === 0){
        return '--';
      }
      else if(intValue > 0){
        moversDirection = 'position-up';
        return '<span class="icon icon-' + moversDirection + '"></span>' + intValue.toString();
      }
      else if(intValue < 0){
        moversDirection = 'position-down';
        return '<span class="icon icon-' + moversDirection + '"></span>' + intValue.toString().replace('-', '');
      }
    } else {
      return '';
    }

  };

  // used to show red bgs on under par scores
  SharedFunctions.underParDisplay = function(value){

    if(value < 0){
      return 'ld-box-under';
    }
    else{
      return false;
    }

  };

  // toggle drawer
  // adds or removes player id to currentDrawers array
  SharedFunctions.toggleDrawer = function(ev, id, context) {
    var currentID = $rootScope.currentDrawer.id,
        currentContext = $rootScope.currentDrawer.context,
        setContext = false, setId = false;

    if (currentID === id) {
      if (currentContext !== context) {
        setId = true;
        setContext = true;
      }
    } else {
      setId = true;
      setContext = true;
    }

    $rootScope.currentDrawer.id = setId ? id : null;
    $rootScope.currentDrawer.context = setContext ? context : currentContext;
  };


  // check if drawer is open?
  SharedFunctions.drawerOpen = function(id, context) {
    var currentID = $rootScope.currentDrawer.id,
        currentContext = $rootScope.currentDrawer.context;

    return (currentID === id && currentContext === context);
  };

  SharedFunctions.getFavouriteCookies = function(){
    if(typeof elvisFunctions.cookie('openFavourites') !== 'undefined'){
      $rootScope.favourites = elvisFunctions.cookie('openFavourites').split(',');

    }
    else{
      $rootScope.favourites = [];
    }
  };

  SharedFunctions.getFavouriteCookies();

  SharedFunctions.updateFavourites = function(playerID){
    var favourites = $rootScope.favourites;

    var comscoreAnalytics = [];

    comscoreAnalytics.push({ key: 'scoring_section', value: 'myLeaderboard favourited player ' + playerID});
    comscoreAnalytics.push({ key: 'ns_ilevel', value: 50 });
    window.customActionProxy.getInstance().NotifyActionMade('leaderboard', comscoreAnalytics);

    if(favourites.indexOf(playerID) > -1){

      var thisIndex = favourites.indexOf(playerID);
      favourites.splice(thisIndex, 1);
      elvisFunctions.cookie('openFavourites', favourites.join(','));

      $rootScope.$broadcast('favsUpdated');
    }
    else{

      if(favourites.length < 100){
        favourites.push(playerID);
        elvisFunctions.cookie('openFavourites', favourites.join(','));

        $rootScope.$broadcast('favsUpdated');
      }

    }

  };

  // display player row based on status
  SharedFunctions.checkStatus = function(playerID, playerStatus){
    var favourites = $rootScope.favourites;

    if(favourites.indexOf(playerID) >= 0){
      return 'favourite';
    }
    else{
      // check player status if not favourite - add class based on value
      if(playerStatus === 2){
        return 'cut';
      }
      else if(playerStatus === 3){
        return 'wd';
      }
      else if(playerStatus === 4){
        return 'dq';
      }
      else{
        return false;
      }
    }
  };

  SharedFunctions.parDisplay = function(hole, parFeed){

    if(angular.isDefined(hole) && angular.isDefined(parFeed)){

      var thisHole = hole.HoleNumber,
          score = hole.Score,
          holePar = parFeed.Holes[thisHole - 1].Par;

      var diff = score - holePar;

      if (diff === 1) {
        return 'ld-box-bogey';
      } else if (diff >= 2) {
        return 'ld-box-dblbogey';
      } else if (diff === -1) {
        return 'ld-box-birdie';
      } else if (diff <= -2) {
        return 'ld-box-eagle';
      }

      return null;

    } else{
      return false;
    }
  };

  SharedFunctions.sortValue = function(str){
    var retStr;
    if(str.indexOf('/')>=0 && str.length < 10){
      var numA = str.substring(0, str.indexOf('/'));
      var numB = str.substring(str.indexOf('/')+1, str.length);
      retStr = (numA/numB)*100;
    } else {
      retStr = str;
    }
    return retStr;
  };

  return SharedFunctions;

}]);
