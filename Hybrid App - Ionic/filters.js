angular.module('starter.filters', [])

.filter('find', function(){
  return function(item, items) {
    for (var index in items) {
      if (items[index].created_at == item.created_at) {
        return index;
      }
    }
    return -1;
  };
});
