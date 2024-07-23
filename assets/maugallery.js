(function ($) {
	// Définition des interactions sur mauGallery
	$.fn.mauGallery = function (options) {
		// options nb de colonnes en fonction de la taille de l'écran
		var options = $.extend($.fn.mauGallery.defaults, options);

		var tagsCollection = [];
		// configuration de la gallerie d'images
		return this.each(function () {
			$.fn.mauGallery.methods.createRowWrapper($(this));
			if (options.lightBox) {
				$.fn.mauGallery.methods.createLightBox(
					$(this),
					options.lightboxId,
					options.navigation
				);
			}
			$.fn.mauGallery.listeners(options);

			$(this)
				.children(".gallery-item")
				.each(function (index) {
					$.fn.mauGallery.methods.responsiveImageItem($(this));
					$.fn.mauGallery.methods.moveItemInRowWrapper($(this));
					$.fn.mauGallery.methods.wrapItemInColumn(
						$(this),
						options.columns
					);
					var theTag = $(this).data("gallery-tag");
					if (
						options.showTags &&
						theTag !== undefined &&
						tagsCollection.indexOf(theTag) === -1
					) {
						tagsCollection.push(theTag);
					}
				});

			if (options.showTags) {
				$.fn.mauGallery.methods.showItemTags(
					$(this),
					options.tagsPosition,
					tagsCollection
				);
			}

			$(this).fadeIn(500);
		});
	};

	// Options par défaut du plugin
	$.fn.mauGallery.defaults = {
		columns: 3,
		lightBox: true,
		lightboxId: null,
		showTags: true,
		tagsPosition: "bottom",
		navigation: true,
	};
	// Ouverture de la modale
	$.fn.mauGallery.listeners = function (options) {
		$(".gallery-item").on("click", function () {
			if (options.lightBox && $(this).prop("tagName") === "IMG") {
				$.fn.mauGallery.methods.openLightBox(
					$(this),
					options.lightboxId
				);
			} else {
				return;
			}
		});

		$(".gallery").on(
			"click",
			".nav-link",
			$.fn.mauGallery.methods.filterByTag
		);
		// Écouteurs pour la navigation dans la lightbox au clic sur les flèches
		$(".gallery").on("click", ".mg-prev", () =>
			$.fn.mauGallery.methods.prevImage(options.lightboxId)
		);
		$(".gallery").on("click", ".mg-next", () =>
			$.fn.mauGallery.methods.nextImage(options.lightboxId)
		);
	};

	// Définition de l'affichage de la galerie et de la lightbox
	$.fn.mauGallery.methods = {
		// ajout des elts bs row à chaque élément de la galerie
		createRowWrapper(element) {
			if (!element.children().first().hasClass("row")) {
				element.append('<div class="gallery-items-row row"></div>');
			}
		},
		// ajout des element BS column à chaque élément de la galerie
		wrapItemInColumn(element, columns) {
			if (columns.constructor === Number) {
				element.wrap(
					`<div class='item-column mb-4 col-${Math.ceil(
						12 / columns
					)}'></div>`
				);
			} else if (columns.constructor === Object) {
				var columnClasses = "";
				if (columns.xs) {
					columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
				}
				if (columns.sm) {
					columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
				}
				if (columns.md) {
					columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
				}
				if (columns.lg) {
					columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
				}
				if (columns.xl) {
					columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
				}
				element.wrap(
					`<div class='item-column mb-4${columnClasses}'></div>`
				);
			} else {
				console.error(
					`Columns should be defined as numbers or objects. ${typeof columns} is not supported.`
				);
			}
		},
		// Déplacer un élément dans le wrapper de ligne
		moveItemInRowWrapper(element) {
			element.appendTo(".gallery-items-row");
		},
		// Rendre l'élément image responsive
		responsiveImageItem(element) {
			if (element.prop("tagName") === "IMG") {
				element.addClass("img-fluid");
			}
		},
		// Ouvrir la lightbox avec l'image cliquée
		openLightBox(element, lightboxId) {
			$(`#${lightboxId}`)
				.find(".lightboxImage")
				.attr("src", element.attr("src"));
			$(`#${lightboxId}`).modal("toggle");
		},
		// Afficher l'image précédente dans la modale de la lightbox
		prevImage() {
			let activeImage = null;
			//definir l'image active --OK
			$("img.gallery-item").each(function () {
				if ($(this).attr("src") === $(".lightboxImage").attr("src")) {
					activeImage = $(this);
				}
			});
			//definir le tag actif --OK
			let activeTag = $(".tags-bar span.active-tag").data(
				"images-toggle"
			);
			let imagesCollection = [];
			//si le tag actif est "all" mettre toutes les images de la galerie dans imagesCollection --OK
			if (activeTag === "all") {
				$(".item-column").each(function () {
					if ($(this).children("img").length) {
						imagesCollection.push($(this).children("img"));
					}
				});
				//si le tag actif est autre mettre toutes les images du tag dans imagesCollection --OK
			} else {
				$(".item-column").each(function () {
					if (
						$(this).children("img").data("gallery-tag") ===
						activeTag
					) {
						imagesCollection.push($(this).children("img"));
					}
				});
			}
			let index = 0,
				next = null;

			$(imagesCollection).each(function (i) {
				if ($(activeImage).attr("src") === $(this).attr("src")) {
					index = i;
				}
			});
			// TODO problème dans la détermination de l'image précédente car index est toujours égal à 0
			// changement de l'ordre et remplacement de imageCollection.length - 1 par imageCollection[index - 1]	;
			next = imagesCollection[index - 1] || imagesCollection[0];
			$(".lightboxImage").attr("src", $(next).attr("src"));
		},
		// Afficher l'image suivante dans la lightbox
		nextImage() {
			let activeImage = null;
			$("img.gallery-item").each(function () {
				if ($(this).attr("src") === $(".lightboxImage").attr("src")) {
					activeImage = $(this);
				}
			});
			let activeTag = $(".tags-bar span.active-tag").data(
				"images-toggle"
			);
			let imagesCollection = [];
			if (activeTag === "all") {
				$(".item-column").each(function () {
					if ($(this).children("img").length) {
						imagesCollection.push($(this).children("img"));
					}
				});
			} else {
				$(".item-column").each(function () {
					if (
						$(this).children("img").data("gallery-tag") ===
						activeTag
					) {
						imagesCollection.push($(this).children("img"));
					}
				});
			}
			let index = 0,
				next = null;

			$(imagesCollection).each(function (i) {
				if ($(activeImage).attr("src") === $(this).attr("src")) {
					index = i;
				}
			});
			next = imagesCollection[index + 1] || imagesCollection[0];
			$(".lightboxImage").attr("src", $(next).attr("src"));
		},
		// Créer la structure HTML de la modale de la lightbox
		createLightBox(gallery, lightboxId, navigation) {
			gallery.append(`<div class="modal fade" id="${
				lightboxId ? lightboxId : "galleryLightbox"
			}" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-body">
                            ${
								navigation
									? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>'
									: '<span style="display:none;" />'
							}
                            <img class="lightboxImage img-fluid" alt="Contenu de l\'image affichée dans la modale au clique"/>
                            ${
								navigation
									? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}">></div>'
									: '<span style="display:none;" />'
							}
                        </div>
                    </div>
                </div>
            </div>`);
		},
		// Afficher les tags de filtres
		showItemTags(gallery, position, tags) {
			var tagItems =
				'<li class="nav-item"><span class="nav-link active active-tag" data-images-toggle="all">Tous</span></li>';
			$.each(tags, function (index, value) {
				tagItems += `<li class="nav-item active"><span class="nav-link" data-images-toggle="${value}">${value}</span></li>`;
			});
			var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

			if (position === "bottom") {
				gallery.append(tagsRow);
			} else if (position === "top") {
				gallery.prepend(tagsRow);
			} else {
				console.error(`Unknown tags position: ${position}`);
			}
		},
		// Filtrer les éléments de la galerie par tag
		filterByTag() {
			if ($(this).hasClass("active-tag")) {
				return;
			}
			$(".active-tag").removeClass("active active-tag");
			$(this).addClass("active active-tag");

			var tag = $(this).data("images-toggle");

			$(".gallery-item").each(function () {
				$(this).parents(".item-column").hide();
				if (tag === "all") {
					$(this).parents(".item-column").show(300);
				} else if ($(this).data("gallery-tag") === tag) {
					$(this).parents(".item-column").show(300);
				}
			});
		},
	};
})(jQuery);
