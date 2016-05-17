Meteor.publish('stats', function() {
	return Albums.find({});
});