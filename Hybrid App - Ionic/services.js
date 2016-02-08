angular.module('starter.services', [])

.factory('Discussions', function(DataService) {

  return {
    all: function() {
      var topics = {};
      DataService.getDiscussions('/discussions/topics')
          .success(function(response){
            //console.log(response.d);

            // handle if no discussion exist
            //if(response.d === null){
            //  $scope.discussError = 'No discussions available';
            //  return;
            //}
            //
            //// hide error message
            //$scope.discussError = '';

            var topics = response.d;
          })
          .error(function(){
            console.log('Nope');
          });
      return topics;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
})
.factory('DataService', ['$http', function ($http) {

  var DataService = {};

  var api = 'http://data.thelist.club/api';
  //var api = 'http://stella-vib.stg.elviscommunications.net/api';

  DataService.getData = function(feed, params) {

    // if params is undefined set to empty
    params = typeof params == 'undefined' ? '' : params;
    console.log('SERVICE request', api + feed + params);

    // return data
    return $http.get(api + feed + params);

  };

  DataService.getDiscussions = function(feed) {
    return $http.get(api + feed)
        .then(
        function (response) {
          return {
            topics: response.data.d
          };
        });
  };

  DataService.getDiscussionComments = function(feed, params) {
    return $http.get(api + feed + params)
        .then(
        function (response) {
          return {
            comments: response.data.d
          };
        });
  };

  DataService.getDiscussionTopic = function(feed, params) {
    return $http.get(api + feed + params)
        .then(
        function (response) {
          console.log(response);
          return {
            topic: response.data.d
          };
        });
  };

  DataService.postData = function(feed, data) {
    return $http.post(api + feed, data, {headers : {'Content-Type': 'application/x-www-form-urlencoded'}})
        .then(
        function (response) {
          console.log(response);
          return {
            data: response.data.d
          };
        });
  };
  DataService.postTopicData = function(feed, data) {
    return $http.post(api + feed, data, {headers : {'Content-Type': 'application/x-www-form-urlencoded'}})
        .then(
        function (response) {
          console.log(response);
          return {
            data: response.data
          };
        });
  };

  return DataService;

}])
.factory('Auth', function ($localstorage) {
   var thisUser = $localstorage.get('credentials');
   var setUser = function (user) {
      //console.log("Setting user :", user);
      thisUser = {'email' : user.username};
      $localstorage.setObject('credentials', {
        email: user.username
      });
   };

   return {
      setUser: setUser,
      isLoggedIn: function () {
         return thisUser ? true : false;
      },
      getUser: function () {
          console.log("U: ", thisUser);
         return thisUser;
      },
      logout: function () {
         $localstorage.removeObject('credentials');
         thisUser = null;
      }
   };
})
.factory('$localstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    },
    removeObject: function(key){
      return $window.localStorage.removeItem(key);
    }
  };
}]);
