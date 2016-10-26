function formatDate(_date) {
    var date = new Date(_date);
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var ampm = hours >= 12 ? 'pm' : 'am';
	hours = hours % 12;
	hours = hours ? hours : 12; // the hour '0' should be '12'
	minutes = minutes < 10 ? '0'+minutes : minutes;
	var strTime = hours + ':' + minutes + ' ' + ampm;
	return date.getMonth()+1 + "/" + date.getDate() + "/" + date.getFullYear() + "  " + strTime;
}

$(function(){

	//Models
	var Event = Backbone.Model.extend({
		url: '/index.html#event',
		defaults: function() {
			return {
				id: 0,
				name: '',
				eventtype: '',
				host: '',
				startdatetime: '',
				enddatetime: '',
				guests: '',
				location: '',
				message: '',
				formattedstartdatetime: '',
				formattedenddatetime: ''
			};
		},
	});

	var Account = Backbone.Model.extend({
		url: '/index.html#account',
		// Default attributes for the Event item.
		defaults: function() {
			return {
				name: '',
				email: '',
				password: '',
				employer: '',
				jobtitle: '',
				birthday: '',
				saved: false
			};
		},
	});

	var Home = Backbone.Model.extend({
		url: '/index.html#home',
		// Default attributes for the Event item.
		defaults: function() {
			return {
				title: 'Event Management',
				content: 'Welcome to the meet-up event planner! Click on the new event button to add an event.'
			};
		},
	});

	var About = Backbone.Model.extend({
		url: '/index.html#about',
		// Default attributes for the Event item.
		defaults: function() {
			return {
				title: 'About',
				content: 'This is the meet-up event planner project for the senior web developer course. I developed this with jQuery, bootstrap, backbone.js and underscore templating.'
			};
		},
	});	

	var Contact = Backbone.Model.extend({
		url: '/index.html#contact',
		// Default attributes for the Event item.
		defaults: function() {
			return {
				title: 'Contact',
				content: 'Feel free to contact me anytime! https://github.com/Chrisg54'
			};
		},
	});	

	var Empty = Backbone.Model.extend({
	defaults: function() {
			return {
			};
		},
	});

	//Collections
	var EventsCollection = Backbone.Collection.extend({
		model: Event,
		url: '/index.html',

		parse: function(data) {
			return data;
		}
	});

	//Views
	var AccountFormView = Backbone.View.extend({
		el: '.main-content',
		template: _.template($('#account-form-template').html()),

		initialize: function() {
			this.listenTo(this.model, 'sync change', this.render);
			this.model.fetch();
			this.render();
			$("#tabs").tabs();
		},

		events: {
			'submit #account-save': 'onSave',
			'keydown #account-password': 'onPasswordKeyDown',
			'click #account-tab': 'onTabClick',
			'click #biography-tab': 'onTabClick',
			'focusout .required': 'onLeaveFocus',
			'focusout .password': 'onPasswordLeaveFocus',
			'keypress .password': 'onPasswordLeaveFocus'
		},

		render: function() {
			// $('#account-create-view').show();
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		},

		onPasswordKeyDown: function(e) {
			var keyCode = e.keyCode || e.which; 

			if (keyCode == 9) { 
				e.preventDefault(); 
				$('#ui-id-2').click();
				$('#account-employer').focus();
			} 
		},

		onSave: function(evt) {
			var $name = this.$('#account-name');
			var $email = this.$('#account-email');			
			var $password = this.$('#account-password');	
			var $employer = this.$('#account-employer');
			var $jobtitle = this.$('#account-jobtitle');
			var $birthday = this.$('#account-birthday');

			this.model.set({name: $name.val(), email: $email.val(), password: $password.val(), employer: $employer.val(), jobtitle: $jobtitle.val(), birthday: $birthday.val() , saved: true})
			this.model.save();

			var homePage = new PageView({model: homeModel});
			homePage.render();	

			var eventModel = new Event();
			var eventformView = new EventFormView({model: eventModel});			
			eventformView.render();

			$('#events-container').show();

			return false;

		},	

		onTabClick: function(event) {
			$('.required-message').hide();
			var x = $(event.target).attr('href');
			$(x).find('input').first().focus();
		},

		onLeaveFocus: function(event) {
			if (event.target.value === '') {
				$('.required-message').hide();
				var label = $(event.target).parent();
				var div1 = $(label).parent();
				var div2 = $(div1).parent();
				$(div2).children('.required-message').show();
				$(event.target).focus();
			}
			else
				$('.required-message').hide();
		},

		onPasswordLeaveFocus: function(event) {
			if (event.target.value != '') {
				if (event.target.value.length < 6) {
				var label = $(event.target).parent();
				var div1 = $(label).parent();
				var div2 = $(div1).parent();
				$(div2).children('.password-message').show();
				$(event.target).focus();
				}
				else
				{
					$('.password-message').hide();
				}
			}
			else
				$('.password-message').hide();
		}		

	});

	var AccountLinkView = Backbone.View.extend({
		el: '#account-name-view',
		template: _.template($('#account-link-template').html()),

		initialize: function() {
			this.listenTo(this.model, 'sync change', this.render);
			this.model.fetch();
			this.render();
		},

		events: {
			'click .account-name': 'onViewAccount'
		},

		render: function() {
			if (this.model.get('name') != '')
			{
				this.$el.html(this.template(this.model.toJSON()));
				return this;
			}
		},

		onViewAccount: function(evt) {
			$('#events-container').hide();
			accountCreate.render();
			$("#tabs").tabs();
		},	

	});

	var EventItemView = Backbone.View.extend({
		tagName: 'li',

		template: _.template($('#event-item-template').html()),

		initialize: function() {

		},

		render: function() {
			this.model.set('formattedstartdatetime', formatDate(this.model.get('startdatetime')));
			this.model.set('formattedenddatetime', formatDate(this.model.get('enddatetime')));
			var html = this.template(this.model.toJSON());
			this.$el.html(html);
			return this;
		},

		events: {
			'click #event-edit' : 'onEditEvent',
			'click #event-delete': 'onDeleteEvent'
		},

		onEditEvent: function(event) {
			var parentDiv = $(event.currentTarget).parent().parent().children('div')[0];
			var eventformView = new EventFormView({model: eventsList.get(parentDiv.id)});	
			$('.event-detail').removeClass('editEvent');
			$(parentDiv).addClass('editEvent');
			eventformView.render();
			window.scrollTo(0, 0);
		},	

		onDeleteEvent: function(event) {
			var parentDiv = $(event.currentTarget).parent().parent().children('div')[0];
			eventsList.remove(eventsList.get(parentDiv.id));
			$(parentDiv).parent().remove();
		}
	});

	var EventFormView = Backbone.View.extend({
		formSetup: false,

		el: $('.main-content'),

		template: _.template($('#event-form-template').html()),

		initialize: function() {
			//this.listenTo(this.collection, 'add', this.render);	
		},

		render: function() {
			var homePage = new PageView({model: homeModel});
			homePage.render();

			var html = this.template(this.model.toJSON());
			this.$el.html(this.$el.html() + html);
			var $name = this.$('#event-name');
			$name.focus();
			return this;
		},

		events: {
			'click #new-event': 'onNewEvent',
			'submit #event-save': 'onAddEvent',
			'focusout .required': 'onLeaveFocus',
			'focusout .daterequired': 'onDateLeaveFocus',
			'focusout #event-start': 'validateStartDate', 
			'keyup #event-start': 'validateStartDate',
			'focusout #event-end': 'validateEndDate',
			'keyup #event-end': 'validateEndDate'
		},

		onNewEvent: function() {
			var $id = this.$('#event-id');
			var $name = this.$('#event-name');
			var $type = this.$('#event-type');
			var $host = this.$('#event-host');
			var $location = this.$('#event-location');
			var $start = this.$('#event-start');
			var $end = this.$('#event-end');
			var $guests = this.$('#event-guests');
			var $message = this.$('#event-message');

			$id.val('0');
			$name.val('');
			$type.val('');
			$host.val('');
			$location.val('');
			$start.val('');
			$end.val('');	
			$guests.val('');
			$message.val('');

			$name.focus();		
		},

		onAddEvent: function() {
			var $id = this.$('#event-id');
			var $name = this.$('#event-name');
			var $type = this.$('#event-type');
			var $host = this.$('#event-host');
			var $location = this.$('#event-location');
			var $start = this.$('#event-start');
			var $end = this.$('#event-end');
			var $guests = this.$('#event-guests');
			var $message = this.$('#event-message');			
			
			if ($id.val() === '0') {

				if ($name.val()) {
					var newevent = eventsList.create({
						id: eventsList.length + 1,
						name: $name.val(),
						eventtype: $type.val(),
						host: $host.val(),
						location: $location.val(),
						startdatetime: $start.val(),
						enddatetime: $end.val(),
						guests: $guests.val(),
						message: $message.val()						
					});

					var $list = $('ul.events-list');

					var item = new EventItemView({model: newevent});
					$list.append(item.render().$el);					
				}
			}
			else {
				// var eventEdit = eventsList.get($id.val());
				// this.model
				this.model.set({
					id: $id.val(),
					name: $name.val(), 
					eventtype: $type.val(), 
					host: $host.val(), 
					location: $location.val(), 
					startdatetime: $start.val(), 
					enddatetime: $end.val(), 
					guests: $guests.val(), 
					message: $message.val()
				});
				this.model.save();
				var item = new EventItemView({model: this.model});
				$('#' + $id.val()).parent().html(item.render().$el);			
			}

			$id.val('0');
			$name.val('');
			$type.val('');
			$host.val('');
			$location.val('');
			$start.val('');
			$end.val('');
			$guests.val('');
			$message.val('');
			return false;
		},

		onLeaveFocus: function(event) {
			if (event.target.value === '') {
				$('.required-message').hide();
				var label = $(event.target).parent();
				var div1 = $(label).parent();
				var div2 = $(div1).parent();
				$(div2).children('.required-message').show();
				$(event.target).focus();
			}
			else
				$('.required-message').hide();
		},

		onDateLeaveFocus: function(event) {
			if (event.target.value === '') {
				$('.required-message').hide();
				var label = $(event.target).parent();
				var div1 = $(label).parent();
				var div2 = $(div1).parent();
				$(div2).children('.required-message').show();
				$(event.target).focus();
			}
			else {
				var dateval = new Date(event.target.value);
				if (dateval.getTime() === '') {
					$('.required-message').hide();
					var label = $(event.target).parent();
					var div1 = $(label).parent();
					var div2 = $(div1).parent();
					$(div2).children('.required-message').show();
					$(event.target).focus();					
				}
				else
					$('.required-message').hide();
			}
		},		

		validateStartDate: function(event) {
			var today = new Date();
			var startdate = new Date(event.target.value);
			var n = startdate.getTimezoneOffset();
			startdate.setHours(startdate.getHours() + (n/60));
			if (today > startdate) {
				$('.startdate-message2').show();
				$('#event-start').focus();
			}	
			else
				$('.startdate-message2').hide();

			if (event.target.value != '' && $('#event-end').val() != '') {
				var startdate = new Date(event.target.value);
				var enddate = new Date($('#event-end').val());
				if (startdate >= enddate) {
					$('.startdate-message').show();
					$('#event-start').focus();
				}
				else {
					$('.startdate-message').hide();
				}
			}
			else
				$('.startdate-message').hide();
		},

		validateEndDate: function(event) {
			if (event.target.value != '' && $('#event-start').val() != '') {
				var enddate = new Date(event.target.value);
				var startdate = new Date($('#event-start').val());
				if (startdate >= enddate) {
					$('.enddate-message').show();
					$('#event-end').focus();
				}
				else
					$('.enddate-message').hide();
			}
			else
				$('.enddate-message').hide();
		}		
	});

	var PageView = Backbone.View.extend({
		el: $('.main-content'),
		template: _.template($('#page-template').html()),

		initialize: function() {

		},

		events: {

		},

		render: function() {
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		}	

	});

	//Application
	var AppView = Backbone.View.extend({

		el: $('#eventapp'),

		events: {
			'click .home':  'showHomePage',
			'click .about':  'showAboutPage',
			'click .contact':  'showContactPage'
		},

		showAccountForm: function(Event) {
			$('#events-container').hide();
			var AccountFormView = new AccountFormView({model: accountModel});
		},

		showHomePage: function(event) {
			if (!accountModel.get('saved')) {
				accountCreate.render();
				$("#tabs").tabs();
			}
			else {
				var eventModel = new Event();
				var eventformView = new EventFormView({model: eventModel});			
				eventformView.render();

				$('#events-container').show();
			}
		},

		showAboutPage: function(Event) {
			$('#events-container').hide();
			var aboutPage = new PageView({model: aboutModel});
			aboutPage.render();
		},

		showContactPage: function(Event) {
			$('#events-container').hide();
			var contactPage = new PageView({model: contactModel});
			contactPage.render();
		}

	});

	var App = new AppView;
	var accountModel = new Account();
	var homeModel = new Home();
	var aboutModel = new About();
	var contactModel = new Contact();
	var emptyModel = new Empty();
	var eventsList = new EventsCollection();

	var AccountLinkView = new AccountLinkView({model: accountModel});
	var accountCreate = new AccountFormView({model: accountModel});


});
