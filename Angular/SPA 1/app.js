/* global elvisFunctions:false */
/* global contentOnDemand:false */
/* global kWidget:false */

'use strict';

/**
 * @ngdoc overview
 * @name LeaderboardApp
 * @description
 * # Leaderboard front end application.
 *
 * Main module of the application.
 */

var leaderboardApp = angular.module('leaderboardApp', ['ChampionshipStatus', 'MyLeaderboard', 'liveServices', 'leaderboardControllers', 'ngRoute', 'ngSanitize']);

leaderboardApp.config(['$routeProvider', '$locationProvider', '$interpolateProvider', function($routeProvider, $locationProvider, $interpolateProvider) {

  $locationProvider.html5Mode(false).hashPrefix('!');
  $interpolateProvider.startSymbol('{-');
  $interpolateProvider.endSymbol('-}');

  $routeProvider
    .when('/traditional', {
      templateUrl: '/templates/sections/leaderboard-traditional.html',
      reloadOnSearch: false
    })
    .when('/holeByHole', {
      templateUrl: '/templates/sections/leaderboard-holebyhole.html',
      reloadOnSearch: false
    })
    .otherwise({
      redirectTo:'/traditional'
    });

}]).
directive('showonhover',function() {
  return {
    link : function(scope, element) {

      if (scope.device === 'desktop') {

        element.on('mouseenter', function() {
          var popoverHtmlFav =  '<div class="popover right popover-white">' +
                                '<div class="arrow"></div>' +
                                '<div class="popover-content popover-content-small">' +
                                '<p class="text-align-center">Remove player from</p>' +
                                '<h4 class="text-align-center">My Leaderboard</h4>' +
                                '</div></div>',
              popoverHtml =     '<div class="popover right popover-dark popover-solid">' +
                                '<div class="arrow"></div>' +
                                '<div class="popover-content popover-content-small">' +
                                '<p class="text-align-center">Add player to</p>' +
                                '<h4 class="text-align-center">My Leaderboard</h4>' +
                                '</div></div>',
              popoverHtmlMax =  '<div class="popover right popover-dark popover-solid">' +
                                '<div class="arrow"></div>' +
                                '<div class="popover-content popover-content-small">' +
                                '<p class="text-align-center">Favourite limit</p>' +
                                '<h4 class="text-align-center">Reached</h4>' +
                                '</div></div>',
              parentID = element.parents('tbody').data('id') + '';

          if(scope.favourites.indexOf(parentID) > -1){
            element.append(popoverHtmlFav);
            element.children('.popover').show();
          }
          else if(scope.favourites.length === 100){
            element.append(popoverHtmlMax);
            element.children('.popover').show();
          }
          else{
            element.append(popoverHtml);
            element.children('.popover').show();
          }

          element.addClass('hover');
        });
        element.on('mouseleave click', function() {
          element.children('.popover').remove();
          element.removeClass('hover');
        });
      }
    }
  };
}).
directive('ldOverlay', ['$timeout', function($timeout) {
  return {
    restrict: 'EA',
    link : function(scope, element) {

      var timer,
          clonedElement = element.clone(),
          id = '#' + element.attr('id');

      clonedElement.addClass('leaderboard-overlay');

      // move html to correct DOM location
      element.remove();

      scope.$watch('showOrientationGraphic', function(newValue){
        var rotateImg = clonedElement.find('.rotate-gif'),
            timestamp = new Date().getTime(),
            srcFrag = rotateImg.data('srcfrag'),
            imgSrc = srcFrag + scope.orientation + '.gif' + '?' + timestamp;

        if(newValue === true){

          // cancel timer
          $timeout.cancel(timer);

          // update gif src
          rotateImg.attr('src', imgSrc);

          // apend overlay
          $('.main-container').prepend(clonedElement);

          elvisFunctions.animateScroll($('.leaderboard'), { offset: 0 });
          $(id).fadeIn(300).one('click.orientationOverlay', function(){
            $timeout(function(){
              scope.$apply(function(){
                scope.showOrientationGraphic = false;
              });
            }, 0);
          });

          // hide after timeout
          timer = $timeout(function(){
            scope.$apply(function(){
              scope.showOrientationGraphic = false;
            });
          }, 5000);

        } else {
          $(id).off('.orientationOverlay').fadeOut(300, function(){
            $(this).remove();
          });
        }

      });

    }
  };
}]).
directive('mediaoverlay',function() {
  return {
    link : function(scope) {

      scope.$watch('showMedia', function(nv){

        // if showMedia is true - create player passing in ID from data
        // if false - destroy player
        if(nv === true){
          contentOnDemand.makePlayer(scope.mediaID, 'kp-single-1', 'streamuk-single');
        }
        else if(nv === false){
          kWidget.destroy('kp-single-1');
        }

      });

    }
  };
});

