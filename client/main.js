Template.aggregate.onCreated(function() {
	let template = Template.instance();

	template.currentArtist = new ReactiveVar( 'all' );
	template.currentAlbum = new ReactiveVar( 'all' );
	template.totalRevenue = new ReactiveVar();
	template.subscribe("stats");
});

let fetchData = function( filters, template ) {
	Meteor.call('getSalesData', filters, function(error, response ) {
		if( error ) {
			alert( error.reason );
		} else {
			template.totalRevenue.set(response);
		}
	});
}  

Template.aggregate.onRendered(function() {
	fetchData({artist: 'all', albums: 'all' }, Template.instance() );
});

Template.aggregate.helpers({
	currentArtist: function() {
		let name = Template.instance().currentArtist.get();
		return name === 'all' ? '' : name;
	},
	artists: function() {
		let albums = Albums.find({},  {field: {artist: 1}});
		if( albums ) {
			//_.uniq - is from underscore library
			return _.uniq( albums.map(function(album) {
				return album.artist;
			}), true );
		}
	},
	albums: function( artistName ) {
		let query = artistName ? {artist: artistName } : {},
			albums = Albums.find( query, { fields: {title: 1 } } );

			if ( albums) {
				return albums.map(function( album ) {
					return album.title;
				});
			}
	},
	totalRevenue: function() {
		let revenues = Template.instance().totalRevenue.get(),
			total = 0; 

		if( revenues ) {
			revenues.map(function( revenue ){total += revenue.total });
		}

		return `${ total / 100 }`;
	},
	revenueItems: function() {
		let revenueItems = Template.instance().totalRevenue.get();

		if( revenueItems ) {
			return revenueItems.map( function(item, index) {
				let album = item._id.album;

				return {
					_id: index,
					item: { artist: item._id.artist, album: album ? album : 'All' },
					total: `$${ item.total / 100 }`
				};
			});
		}
	}
});

Template.aggregate.events({
	'change [name="artist"]': function(event, template) {
		let artist = event.target.value;
		template.currentArtist.set(artist);

		let album = template.find('[name="album"]'),
			isMatch = Albums.findOne({artist, album: album.value});

		if( !isMatch ) {
			album.querySelector( 'option[value="all"]' ).setAttribute( 'selected', true );
			template.currentAlbum.set( 'all' );
		}
	},
	'change [name="album"]': function(event, template) {
		template.currentAlbum.set( event.target.value );
	},
	'change [data-filter]': function(event, template) {
		fetchData({
			artist: template.currentArtist.get(),
			album: 	template.currentAlbum.get()
		}, template );
	} 
});
