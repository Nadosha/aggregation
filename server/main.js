Meteor.methods({
	getSalesData(filter) {

		let group = {
			_id: {
				artist: '$artist'
			},
			total: {
				$sum: '$revenue'
			}
		};

		if (filter.artist !== 'all') { group._id.album = '$album'; }
		if (filter.artist == 'all') { delete filter.artist; }
		if (filter.album === 'all') { delete filter.album; }

		return Albums.aggregate(
			{ $match: filter },
			{ $group: group }
		);
	}
});