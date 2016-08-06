

$(function () {
	"use strict";
		
	var viewModule = (function () {
		var minMaxPrice = [],
			price;

		var view = {
			/*// создание елемента контента Вова
			createItem: function ( obj, i ){
				var $a, $img, $div, $ul, $button;

				$a = $("<a class='mainItem'/>").attr({href: "#", "data-productId": i});
				$img = $("<img alt='#'/>").attr({ src: obj.img });
				$div = $("<div/>");
				$ul = $("<ul/>")
				.append($("<li/>").attr( { name: "name"	}).text( obj.name ),
					$("<li/>").attr( {name: "genre"}).text( obj.genre ),
					$("<li/>").attr( {name: "platform"}).text( obj.platform ),
					$("<li/>").attr( {name: "price"}).text( obj.price )
					);
				$button = $( "<button> Купить </button>");

				$div.append( $ul, $button );
				$a.append( $img, $div );
				return $a;
			},*/

			// получение максимальной стоимости игры
			getMaxPrice: function ( data ){
				var arrPrice = data.map( function( el ){
					return parseInt( el.price );
				});
				return Math.max.apply( null, arrPrice );
			},

			initSlider: function() {
				$( "#slider-range" ).slider({
					range: true,
					min: price.min,
					max: price.max,
					values: [ price.min, price.max],
					slide: function( event, ui ) {
						$( "#amount" ).val( "₴ " + ui.values[ 0 ] + " - ₴ " + ui.values[ 1 ] );
					},
					// событие стоп Вова
					stop: function( event, ui ) {
						minMaxPrice = [ui.values[0],  ui.values[1]];
						//console.log( minMaxPrice );
					}
				});
				$( "#amount" ).val( "₴ " + $( "#slider-range" ).slider( "values", 0 ) +
					" - ₴ " + $( "#slider-range" ).slider( "values", 1 ) );
			},
		};

		price = {
			max: view.getMaxPrice( data.array ),
			min: 0
		};

		view.initSlider();
		


		return {
			
			// добавление контента на страничку Вова
			/*setContent: function ( arr ){
			
				var $content = $( "#content" );

				$( "#content a" ).remove();
				$.each( arr, function( i, obj){
					$content.append( view.createItem( obj, i ) );
				});
			},*/
			setContent: function ( arr ) {
				var json = JSON.stringify( arr );
				json = JSON.parse( json );
				//console.log( json );
				$( "#content" ).empty();
				var template = Handlebars.compile( $('#contentItemTemplate').html() );
				$('#content').append( template( json ) );
			},

			// сообщение при пустой корзине
			setError: function(){
				var $content = $( "#content" );
				$content.append($( "<div class='error'></div>" ).text( "Сhoose a different value" ));
			},

			sortPrice: function (){
				return minMaxPrice;
			},
			initPrice: function () {
				return price;
			}
		};
	} ());
	
	
	var filterModule = (function () {
		var that,
			minMaxPrice,
			newArr = { "array": data.array };

		var filter = {

			// фильтр по цене
			getPriceFilterArr: function ( data, minPrice, maxPrice ){
				return $.map( data, function( el ){
					if( parseInt( el.price ) >= minPrice && parseInt( el.price ) <= maxPrice ){
						return el;
					}
				});
			},

			//функция фильтрации обектов по критерию Вова
			getFilterArr: function ( data , key, value){
				var arrObj = $.map( data, function ( el ){
					if( el[key] === value ){
						return el;
					}
				} );
				return arrObj;
			},


			// функция сортировки

			getSortArr: function ( arr, name, dataID ){

				return [].sort.call( arr, function( a, b ){
					if( dataID === "up" ){
						//console.log( a[name]  );
						if ( parseInt( a[name] ) > parseInt( b[name] ) )
							return -1;
						if ( parseInt( a[name] ) < parseInt( b[name] ) )
							return 1;
						return 0;
					}
					if( dataID === "down" ){
						if ( parseInt( a[name] ) > parseInt( b[name] ) )
							return 1;
						if ( parseInt( a[name] ) < parseInt( b[name] ) )
							return -1;
						return 0;
					}
				});
			},
			checkInspector: function ( arr, item ) {
				var $inputs = $( "input:checked", item),
					concatArr = [];
					//console.log(  this );
				if ( $inputs.length ){
					$inputs.each( function( i, item ){
						var tempArr = that.getFilterArr( arr, $( item ).attr( "name" ), $( item ).attr( "value" ));
						concatArr = concatArr.concat( tempArr );
						console.log( concatArr );
					} );
					arr = concatArr;	
				}
				return arr;
			},

			filterEvent: function() {
				that = this;
				var price = viewModule.initPrice();

				$("#filter").submit( function( e ){
					e.preventDefault();

					var inputsDiv = $('.checkBlock'),
						arrGenre = [],
						arrPlatform = [],
						minMaxPrice = viewModule.sortPrice();


					newArr.array = data.array;
					

					if( minMaxPrice.length ){
						newArr.array = that.getPriceFilterArr( newArr.array, minMaxPrice[0], minMaxPrice[1] );
					}

					$.each( inputsDiv, function( i, item ){
						newArr.array = that.checkInspector( newArr.array, item );
					});

					//console.log(newArr);
					viewModule.setContent( newArr );

					if ( !newArr.array.length )
						viewModule.setError();
				});

				$("#filter").on( "reset", function( e ){
					e.preventDefault();
					var check = $("input:checked");
					if( check.length ){
						$.each( check, function(i, el){
							//console.log( el );
							$( el ).prop( "checked", false );
						});
					}
					$( "#slider-range" ).slider({
						range: true,
						min: price.min,
						max: price.max,
						values: [ price.min, price.max ],
						slide: function( event, ui ) {
							$( "#amount" ).val( "₴ " + ui.values[ 0 ] + " - ₴ " + ui.values[ 1 ] );
						}
					});
				
					$( "#amount" ).val( "₴ " + $( "#slider-range" ).slider( "values", 0 ) +
					" - ₴ " + $( "#slider-range" ).slider( "values", 1 ) );

					newArr.array = data.array;
					
					viewModule.setContent( newArr );
				});
			},
			sortEvent: function(){
				that = this;
				$("#headContent button").click( function(e){
					var data = $( this ).attr("data"),
						name = this.name;
					//console.log( name, data);	
					newArr.array = that.getSortArr( newArr.array, name, data );
					//console.log( newArr );
					viewModule.setContent( newArr );

					$(".choise").removeClass();
					$( this ).addClass( "choise" );

				});
			},

		};
		//console.log(newArr);
		viewModule.setContent( newArr );
		filter.filterEvent();
		filter.sortEvent();

		return {

			returnObj: function( i ){
				return newArr.array[ i ];
			}

		};
	} ());

	// модуль обработки формы входа Максим
	var loginModul = (function(){
		var log,
			that;

		var login = {

			getLogin: function(){
				log = $("#singIn input[type='text']").val().trim();
				if( log ){
					localStorage.setItem('userName', log );
					return true;
				}
				return false;
			},

			setLogin: function( text ){
				if (text === undefined ){
					text = log;
				}
				$( "#logOut b" ).text( text );
			},

			toggleView: function (){
				$( "#logIn" ).toggleClass( "hidden" );
				$( "#logOut" ).toggleClass( "hidden" );
			},


			// Событие входа на сайт Максим
			logIn: function (){
				that = this;
				$( "#singIn" ).submit( function( e ){
					e.preventDefault();
					var userlog = that.getLogin();
					if ( userlog ){
						that.setLogin();
						that.toggleView();
						this.reset(); 
					}
				});
			},

			// Событие выхода с сайта Максим
            logOut: function(){
            	that = this;
            	$( "#logOut button" ).click( function( e ){
					that.toggleView();
					localStorage.setItem('userName', "" );
										
				});
			},

			logVisible: function(){
				var login = localStorage.userName;

				if ( login ) {
					this.setLogin( login );
					$( "#logIn" ).addClass( "hidden" );
					$( "#logOut" ).removeClass( "hidden" );		
					
					return true;
				}
				$( "#logOut" ).addClass( "hidden" );
				$( "#logIn" ).removeClass( "hidden" );
				
				return false;
				
			}

		};
		
		login.logIn();	
		login.logOut();	
		login.logVisible();		
	}());

	// модуль корзины
	var basketModul = (function	() {
		var obj,
			jsonBasket = { arr: [] },
			json,
			that;

		
		var basket = {

			/*// создание элемент корзины
			createBasketItem: function ( obj, i ){
				var $mainDiv, $a, $img, $div, $div2, $button;

				$a = $( "<a class='basketItem'/>" ).attr({ href: "#",  "data-basketId": i });
				$img = $( "<img alt='#'/>" ).attr({ src: obj.img });
				$div = $( "<div class='name'/>" ).text( obj.name );
				$div2 = $( "<div class='price'/>" ).text( obj.price );
				$button = $( "<button class='del'><i class='fa fa-times' aria-hidden='true'></i></button>" );
				$a.append( $img, $div, $div2, $button );

				return $a;
			},
			*/
			
			/*pushToBasket: function ( arr ){
				var $basket = $( ".basketField" );
				that = this;

				$( ".basketField a" ).remove();
				$.each( arr, function( i, obj ){
					$basket.append( that.createBasketItem( obj, i ) );
				});
			},*/
			
			// добавление товаров в корзину
			pushToBasketHB: function ( arr ) {
				var json = JSON.stringify( arr );
				
				json = JSON.parse( json );
				//console.log( json );
				$( ".basketField" ).empty();
				this.sumItem( json.arr );
				var template = Handlebars.compile( $('#basketItemTemplate').html() );
				$('.basketField').append( template( json ) );
			},

			// запись содержимого корзины в LS
			writeBasketToLS: function ( arr ) {
				json = JSON.stringify( arr );
				localStorage.removeItem( "arr" );
				localStorage.setItem( "arr", json );
			}, 

			// добавление товаров в корзину с LS
			readBasketItemFromLS: function () {
				var item = localStorage.arr;
				if ( item ){
					jsonBasket = JSON.parse( item );
					//console.log( item );
					this.pushToBasketHB( jsonBasket );
				}
			},

			// подсчет товаров в корзине
			countAndShowItem: function () {
				var count = $( ".basketItem" ).length;
				$( ".basketPoints" ).text( count );

				if ( !count ){
					$( ".basketField" ).append( $( "<div class='basketIsEmpty' />").text( "Товар ещё не добавлено!!" ) );
				}
				else {
					$( ".basketIsEmpty" ).remove();
				}
			},
			// подсчет суммы товаров
			sumItem: function ( arr ) {
				var $basketField = $(".basketField"),
				$div = $("<div class='sumDiv' />"),
				sum = 0;

				$( ".sumDiv" ).remove();
				$.each( arr, function ( i, item ) {
					sum += parseInt( item.price);					
				}); 
				if ( sum ){
					$basketField.append( $div.text( "Сумма покупки состовляет " + sum + " грн." ) );
				}
			},

			// открыть корзину
			openBasket: function () {
				$( ".basket" ).click( function(e){
					e.preventDefault();
					$( ".basketDropDown" ).addClass( "dropDown" );
				});
			},

			// закрыть корзину
			closeBasket: function () {
				$( ".close" ).click( function (e) {
					e.preventDefault();
					$( ".basketDropDown" ).removeClass( "dropDown" );
				});
			},

			// добавить товар в корзину, клик по кнопке Купить
			addItemToBasket: function(){
				that = this;
				$( "#content" ).click( function(e){
					e.preventDefault();
					if ( e.target.tagName === "BUTTON" ){
						var id = $( e.target.closest( "[data-productId]" ) ).attr( "data-productId" );
						obj = filterModule.returnObj( id );
						//console.log( obj );
						[].push.call( jsonBasket.arr, obj );
						//console.log( jsonBasket );					
						that.pushToBasketHB( jsonBasket );
						that.countAndShowItem( );
						that.writeBasketToLS( jsonBasket );
					}
				});
			},

			// удалить товар с корзины
			removeItemFromBasket: function (){
				that = this;
				$( ".basketField" ).click( function(e){
					e.preventDefault();
					if ( e.target.closest( ".del" ) ){
						var item = $( e.target.closest( "[data-basketId]" ) ).attr( "data-basketId" );
						
						[].splice.call( jsonBasket.arr, item, 1 );

						that.pushToBasketHB( jsonBasket );
						that.countAndShowItem( );
						that.writeBasketToLS( jsonBasket );
					}	
				});
			}
		};

		basket.readBasketItemFromLS();
		basket.countAndShowItem();
		basket.openBasket();
		basket.closeBasket();
		basket.addItemToBasket();
		basket.removeItemFromBasket();
	}());

});


