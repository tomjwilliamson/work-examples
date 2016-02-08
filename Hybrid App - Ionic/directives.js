'use strict';

/* Directives */

angular.module('starter.directives', [])

.directive('notification', function ($rootScope) {
  var notificationFn = function(scope, element, attrs, $rootScope) {

    var button = element;

    button.bind("click", function() {
      var class_arr = element[0].classList,
          url = button[0].dataset.url.length ? button[0].dataset.url : '',
          desc = button[0].dataset.description,
          title = button[0].dataset.title,
          twitter_desc = '';

      if((desc.length + url.length) > 140) {

        twitter_desc = desc.substring(0,(140 - 3 - 23)); // 137 to allow for ellipsis and urls take 22 chars no matter their length
        twitter_desc += "... " + url;
      }
      else {
        twitter_desc = desc;
      }

      if(class_arr.contains("share-notification")) {
        scope.$apply(function(){
          scope.$root.description = desc;
          scope.$root.twitter_desc = twitter_desc;
          scope.$root.title = title;
          scope.$root.url = url;
          scope.$root.notification = {social:true};
        });
      }
    });
  };
  return {
    link: notificationFn,
    restrict: 'A'
  };
})


.directive('repeatFadein', function() {
  return {
    restrict: 'A',
    link: function(scope, ele, attrs) {
      $(ele).css({ opacity: 0 })
            .delay(150)
            .animate({ opacity: 1 }, parseInt(attrs.repeatFadein));
    }
  };
});

