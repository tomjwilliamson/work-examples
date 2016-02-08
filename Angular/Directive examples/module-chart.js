'use strict';
/* global openGlobals:false */

/*
  chart module
 */
var chart = angular.module('chart', ['ngSanitize']);

chart.directive('chart', [ function() {
  return {
    restrict: 'A',
    scope: {
      chartOpen: '=',
      chartValue: '=',
      chartMax: '=',
      chartShowPercentage: '=',
      chartColour: '=',
      chartSize: '=',
      chartType: '=',
      chartStartval: '=',
      chartFinalval: '='
    },
    replace: true,
    templateUrl: openGlobals.paths.live.chartTemplate,
    link: function (scope, element) {
      var hasBeenInitiated = false;

      var getSettings = function() {
        return {
          'value': scope.chartValue,
          'max': scope.chartMax,
          'hasPercentage': scope.chartShowPercentage,
          'size': scope.chartColour,
          'colour': scope.chartSize,
          'type': scope.chartType,
          'startval': scope.chartStartval,
          'finalval': scope.chartFinalval
        };
      };

      var initGraph = function() {
        $(element).graph( getSettings() );
      };

      scope.$watch('chartOpen', function(val) {
        if ( val && !hasBeenInitiated && typeof scope.chartValue !== 'undefined' ) {

          initGraph();

          hasBeenInitiated = true;
        }
      });

      scope.$watch('chartValue', function(val) {
        if ( val && scope.chartOpen ) {
          if (!hasBeenInitiated) {

            initGraph();

            hasBeenInitiated = true;
          } else {

            $(element).graph('updateStats', getSettings());
          }
        }
      });
    }
  };
}]);
